// Smart Import Feature Module
// AI-powered subscription extraction from images, PDFs, and CSVs
import './smart-import.css';
import { initAurora } from './Aurora.js';
import { GmailSync } from '../gmail-sync/gmail-sync.js';

// ─── Constants ──────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// ─── State ──────────────────────────────────────────────────
let selectedFile = null;
let detectedSubs = [];
let selectedSubs = new Set();
let modalEl = null;
let currentActiveOption = null;
let activeAurora = null;

// ─── Toast ──────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
    let toast = document.getElementById('smart-import-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'smart-import-toast';
        toast.className = 'smart-import-toast';
        document.body.appendChild(toast);
    }

    const icons = {
        success: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>`,
        error: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff5050" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
        info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7df9ff" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`
    };

    toast.innerHTML = `${icons[type] || icons.info} ${message}`;
    toast.className = `smart-import-toast ${type}`;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ─── File Reading ────────────────────────────────────────────
async function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1024;

                if (width > height && width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to 0.8 quality JPEG to drastically reduce payload size
                const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                resolve(base64);
            };
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// ─── PDF to Images (handles both text and scanned PDFs) ──────
async function extractPdfAsText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    // Only parse first 10 pages for text to keep it reasonably fast
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    
    return fullText.trim();
}

async function extractPdfAsImages(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images = [];

    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // cap at 5 pages for vision
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // high res
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        images.push(base64);
    }

    return images;
}

// ─── Groq AI Extraction ──────────────────────────────────────
const EXTRACTION_SYSTEM_PROMPT = `You are an exhaustive, row-by-row subscription extraction machine.
Your task is to scan the provided content (image/PDF/CSV) and extract EVERY SINGLE transaction or subscription entry visible.

SCANNING PROTOCOL:
1. Scan from Top to Bottom.
2. For EVERY visual row or entry found:
   - Identify the BRAND/NAME through logos and text.
   - Extract the PRICE (be precise, including decimals).
   - Identify the CURRENCY and SYMBOL.
   - Extract the DATE or billing day.
   - Determine the TYPE (monthly/yearly/trial/one-time).
3. DO NOT group entries. If "Spotify" appears twice, list it TWICE. If there are multiple identical receipts, list EACH one.
4. Total Exhaustivity is required. Missing an entry is a failure.

JSON SCHEMA:
Return a JSON array of objects with (FOLLOW THIS EXTRACTION HIERARCHY: 1. Name/Logo, 2. Price/Currency, 3. Full Date):
- "name": string - EXHAUSTIVE Search for the brand/service name. If logo present but name is text-heavy, prioritize the Brand.
- "domain": string - The most likely root domain for the name (e.g., "spotify.com"). REQUIRED for icons.
- "price": number OR string - Extract precisely including decimals. 
- "currency": string - (e.g., "USD", "INR", "GBP").
- "symbol": string - (e.g., "$", "₹", "£").
- "type": string - "monthly" | "yearly" | "trial" | "one-time".
- "date": string - Full Date (YYYY-MM-DD). If year/month missing, use current year/month.

Return ONLY the raw JSON array. NO code blocks, NO text.`;

async function callGroqVision(base64Image, mimeType) {
    const supabase = window.supabase;
    if (!supabase) throw new Error('Supabase not ready');

    const { data, error } = await supabase.functions.invoke('sync-groq', {
        body: { 
            image: base64Image, 
            mimeType: mimeType,
            systemPrompt: EXTRACTION_SYSTEM_PROMPT 
        }
    });

    if (error || (data && data.error)) throw new Error(error?.message || data?.error || 'AI Sync Error');
    return data.reply || '[]';
}

async function callGroqText(text) {
    const supabase = window.supabase;
    if (!supabase) throw new Error('Supabase not ready');

    const { data, error } = await supabase.functions.invoke('sync-groq', {
        body: { 
            userPrompt: `Extract subscriptions from this content:\n\n${text}`,
            systemPrompt: EXTRACTION_SYSTEM_PROMPT 
        }
    });

    if (error || (data && data.error)) throw new Error(error?.message || data?.error || 'AI Sync Error');
    return data.reply || '[]';
}

// ─── Parse AI Response ───────────────────────────────────────
function parseAIResponse(raw) {
    const sanitize = (list) => {
        if (!Array.isArray(list)) return [];
        return list.map(s => {
            if (!s || !s.name) return null;
            // Robust price conversion
            let price = s.price;
            if (typeof price === 'string') {
                price = parseFloat(price.replace(/[^\d.]/g, ''));
            }
            if (isNaN(price)) price = 0;
            
            // Handle full date string
            let fullDate = s.date;
            let billingDay = 1;

            if (typeof fullDate === 'string' && fullDate.includes('-')) {
                const parts = fullDate.split('-');
                billingDay = parseInt(parts[2]) || 1;
            } else if (typeof fullDate === 'number') {
                billingDay = fullDate;
                const now = new Date();
                fullDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(billingDay).padStart(2,'0')}`;
            }
            
            return {
                ...s,
                price: price,
                date: billingDay, // For compatibility with legacy Day integer
                startDate: fullDate, // Preserve the month/year string
                type: s.type || 'monthly'
            };
        }).filter(Boolean);
    };

    try {
        let cleaned = raw.trim();
        cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        
        const parsed = JSON.parse(cleaned);
        return sanitize(parsed);
    } catch (e) {
        console.warn('[SmartImport] Failed to parse AI response:', raw, e);
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) {
            try {
                return sanitize(JSON.parse(match[0]));
            } catch (e2) {}
        }
        return [];
    }
}

// ─── Analysis Pipeline ───────────────────────────────────────
async function analyzeFile(file) {
    const setStep = (idx, state, text) => {
        const steps = modalEl?.querySelectorAll('.status-step');
        if (!steps?.[idx]) return;
        steps[idx].className = `status-step ${state}`;
        const textEl = steps[idx].querySelector('.step-text');
        if (textEl) textEl.textContent = text;
        
        const indicator = steps[idx].querySelector('.step-indicator');
        if (state === 'active') {
            indicator.innerHTML = '<div class="spinning-indicator"></div>';
        } else if (state === 'done') {
            indicator.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>`;
        } else if (state === 'error') {
            indicator.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
        } else {
            indicator.textContent = String(idx + 1);
        }
    };

    // Show status section
    const statusEl = modalEl?.querySelector('.smart-import-status');
    if (statusEl) statusEl.classList.add('visible');

    let rawResponse = '';

    // STEP 1: Read file
    setStep(0, 'active', 'Reading file...');
    await delay(300);

    try {
        const ext = file.name.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            if (file.size > 4 * 1024 * 1024) { // Lowered to 4MB
                throw new Error('Image too large. Please use a file under 4MB.');
            }
            setStep(0, 'done', 'Image loaded ✓');

            // STEP 2: Analyze with vision AI
            setStep(1, 'active', 'Scanning with AI Vision...');
            const base64 = await readFileAsBase64(file);
            const mimeType = file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            rawResponse = await callGroqVision(base64, mimeType);

        } else if (ext === 'pdf') {
            setStep(0, 'done', 'PDF loaded ✓');
            setStep(1, 'active', 'Extracting document text...');
            
            const text = await extractPdfAsText(file);
            
            if (text && text.length > 50) {
                // If we successfully got enough text, use callGroqText (more accurate/cheaper)
                setStep(1, 'done', 'Text extracted ✓');
                setStep(2, 'active', 'Processing with AI...');
                rawResponse = await callGroqText(text);
            } else {
                // If it's a scanned PDF (no text), fall back to vision
                setStep(1, 'active', 'Scanned PDF: Converting to images...');
                const images = await extractPdfAsImages(file);
                
                setStep(1, 'done', `${images.length} page(s) ready ✓`);
                setStep(2, 'active', 'Scanning via AI Vision...');
                
                let allSubs = [];
                for (const base64 of images) {
                    const raw = await callGroqVision(base64, 'image/jpeg');
                    const pageSubs = parseAIResponse(raw);
                    allSubs = [...allSubs, ...pageSubs];
                }
                return allSubs;
            }

        } else if (ext === 'csv') {
            setStep(0, 'done', 'CSV loaded ✓');
            setStep(1, 'active', 'Parsing CSV data...');
            const csvText = await readFileAsText(file);
            rawResponse = await callGroqText(csvText);

        } else {
            throw new Error('Unsupported file type');
        }

        setStep(1, 'done', 'AI analysis complete ✓');

        // STEP 3: Parse results
        setStep(2, 'active', 'Extracting subscriptions...');
        await delay(400);

        const subs = parseAIResponse(rawResponse);
        setStep(2, 'done', `Found ${subs.length} subscription${subs.length !== 1 ? 's' : ''}`);

        return subs;

    } catch (err) {
        const failedStep = rawResponse ? 2 : 1;
        setStep(failedStep, 'error', `Error: ${err.message}`);
        throw err;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Render Results ──────────────────────────────────────────
async function renderResults(subs) {
    const resultsContainer = modalEl?.querySelector('.smart-import-results');
    const resultsList = modalEl?.querySelector('.results-list');
    const countBadge = modalEl?.querySelector('.results-count-badge');
    const footerEl = modalEl?.querySelector('.smart-import-footer');
    
    if (!resultsContainer || !resultsList) return;

    resultsList.innerHTML = '';
    
    if (!subs || subs.length === 0) {
        resultsContainer.classList.remove('visible');
        const emptyEl = modalEl?.querySelector('.smart-import-empty');
        emptyEl?.classList.add('visible');
        footerEl?.classList.remove('visible');
        return;
    }

    // 1. Determine Preferred Currency and Fetch Rates
    const settings = window.userProfile?.settings || {};
    const targetCurrency = settings.currency || 'USD';
    const targetCurrObj = (window.CURRENCIES || []).find(c => c.code === targetCurrency) || { symbol: '$' };
    const targetSymbol = targetCurrObj.symbol;
    
    let rates = null;
    try {
        // Only fetch if there's a reason to (at least one sub is in a different currency)
        const hasOtherCurrency = subs.some(s => (s.currency || 'USD') !== targetCurrency);
        if (hasOtherCurrency && window.fetchExchangeRates) {
            rates = await window.fetchExchangeRates(targetCurrency);
        }
    } catch (e) {
        console.warn('[SmartImport] Exchange rates unavailable:', e);
    }

    // Prepare Results
    if (countBadge) countBadge.textContent = `${subs.length} FOUND`;
    
    // Select all by default
    selectedSubs = new Set(subs.map((_, i) => i));

    subs.forEach((sub, idx) => {
        const logoUrl = window.getLogoUrl ? window.getLogoUrl(sub.domain || sub.name) : '';
        
        // Imported Price Display
        const subCurrency = sub.currency || 'USD';
        const subSymbol = (window.CURRENCIES || []).find(c => c.code === subCurrency)?.symbol || '$';
        const formattedImported = `${subSymbol}${parseFloat(sub.price).toFixed(2)}`;
        
        // Exchange Price Display
        let prefPriceHtml = '';
        if (rates && subCurrency !== targetCurrency && window.getConvertedPrice) {
            const converted = window.getConvertedPrice(sub.price, subCurrency, targetCurrency, rates);
            prefPriceHtml = `<div class="result-price-pref">${targetSymbol}${converted.toFixed(2)}/mo</div>`;
        }
        
        const card = document.createElement('div');
        card.className = 'result-sub-card selected';
        card.dataset.idx = idx;
        
        // Fast staggered delay
        const delay = idx * 60; 
        card.style.animationDelay = `${delay}ms`;

        card.innerHTML = `
            <div class="result-card-main">
                <div class="result-icon-box">
                    <img src="${logoUrl}" alt="${sub.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="result-icon-fallback" style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); font-weight: 700; font-size: 1.2rem; font-family: 'Outfit', sans-serif;">
                        ${sub.name.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="result-info">
                    <div class="result-name">${sub.name}</div>
                    <div class="result-date">${sub.startDate || (sub.date ? `Day ${sub.date}` : 'Monthly Subscription')}</div>
                </div>
            </div>
            <div class="result-price-area">
                <div class="result-price-main">${formattedImported} ${subCurrency}/mo</div>
                ${prefPriceHtml}
            </div>
        `;

        card.addEventListener('click', () => toggleSubSelection(card, idx));
        resultsList.appendChild(card);
        
        // Staggered haptics as they appear
        setTimeout(() => {
            if (window.HapticsService) window.HapticsService.light();
        }, idx * 100);
    });

    resultsContainer.classList.add('visible');
    if (footerEl) {
        footerEl.classList.add('visible');
        footerEl.style.display = 'flex';
    }
    
    // Initial success haptic
    if (window.HapticsService) window.HapticsService.success();
    
    updateImportBtn();
    updateSelectAllBtn();
}

function toggleSubSelection(card, idx) {
    if (selectedSubs.has(idx)) {
        selectedSubs.delete(idx);
        card.classList.remove('selected');
        if (window.HapticsService) window.HapticsService.light();
    } else {
        selectedSubs.add(idx);
        card.classList.add('selected');
        if (window.HapticsService) window.HapticsService.medium();
    }
    updateImportBtn();
    updateSelectAllBtn();
}

function updateImportBtn() {
    const btn = modalEl?.querySelector('.import-selected-btn');
    if (!btn) return;
    const count = selectedSubs.size;
    btn.disabled = count === 0;
    btn.innerHTML = count === 0
        ? 'select subs'
        : `Import ${count} Subs`;
}

function updateSelectAllBtn() {
    // Select all btn is now a static Cancel button
}

// ─── Import Subscriptions ────────────────────────────────────
async function importSelected() {
    if (!window.saveToSupabase || !window.subscriptions) {
        showToast('App readying... please try again.', 'error');
        return;
    }

    const subsToImport = [...selectedSubs].map(i => detectedSubs[i]);
    if (subsToImport.length === 0) {
        showToast('No subscriptions selected.', 'info');
        return;
    }

    const btn = modalEl?.querySelector('.import-selected-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<div class="btn-spinner"></div> Syncing...';
    }

    let successCount = 0;
    const currentSubs = window.subscriptions;

    // Show Aurora for syncing state
    showAurora(true, 'SYNCING SUBSCRIPTIONS...');

    for (const sub of subsToImport) {
        try {
            // Generate a numeric temp ID similar to main.js for compatibility
            const tempId = Date.now() + Math.floor(Math.random() * 100000);
            
            // Format date to ISO string if it's a simple YYYY-MM-DD
            let startDate = sub.startDate;
            if (startDate && startDate.length === 10) {
                startDate = new Date(startDate + 'T12:00:00').toISOString();
            }

            const newSub = {
                id: tempId,
                name: sub.name || 'Untitled Subscription',
                price: parseFloat(sub.price) || 0,
                date: parseInt(sub.date) || 1,
                type: sub.type || 'monthly',
                domain: sub.domain || '',
                currency: sub.currency || 'USD',
                symbol: sub.symbol || '$',
                // Use standard color tokens from main.js
                color: sub.type === 'trial' ? '--accent-red' : (sub.type === 'one-time' ? '--accent-purple' : '--accent-blue'),
                stopped: false,
                paid: false,
                recurring: sub.type === 'monthly' ? 'recurring' : null,
                startDate: startDate,
                notes: 'Imported via Sublify Sync'
            };

            // 1. Add to local array
            currentSubs.push(newSub);
            
            // 2. Persist to Supabase and LocalStorage
            // saveToSupabase handles the ID replacement and localStorage update internally
            const savedSub = await window.saveToSupabase(newSub);
            
            // 3. If DB returned a real ID, update our local object
            if (savedSub && savedSub.id && savedSub.id !== tempId) {
                newSub.id = savedSub.id;
                localStorage.setItem('subscriptions', JSON.stringify(currentSubs));
            }

            successCount++;
        } catch (err) {
            console.error('[SmartImport] Error importing:', sub.name, err);
        }
    }

    // Sync complete - we keep Aurora visible until closeSmartImport handles the cleanup
    // to prevent the "glitch" of buttons briefly reappearing.

    // Direct UI updates
    if (window.renderCalendar) window.renderCalendar();
    if (window.updateStats) window.updateStats();
    if (window.loadSubscriptions) {
        // Optional: trigger a full reload to be sure, 
        // but renderCalendar should be enough if local array is updated.
    }

    if (successCount > 0) {
        if (window.HapticsService) window.HapticsService.success();
        showToast(`✓ ${successCount} Subscriptions added!`, 'success', 3000);
        
        // Trigger the success state on the background banner button
        if (window.showCalendarSyncSuccess) {
            window.showCalendarSyncSuccess(successCount);
        }
    }

    closeSmartImport();
}

// ─── File Handling ───────────────────────────────────────────
function handleFileSelected(file) {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (currentActiveOption === 'bank') {
        if (!['pdf', 'csv'].includes(ext)) {
            showToast('Please upload a PDF or CSV for bank statements.', 'error', 4000);
            return;
        }
    } else if (currentActiveOption === 'email' || currentActiveOption === 'image') {
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            showToast('Please upload an image (JPG or PNG) for receipts.', 'error', 4000);
            return;
        }
    } else {
        const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'csv'];
        if (!allowedExts.includes(ext)) {
            showToast('Unsupported file type.', 'error');
            return;
        }
    }

    selectedFile = file;

    // Update upload zone
    const heroEl = modalEl?.querySelector('.smart-import-hero');
    if (heroEl) heroEl.style.display = 'none';
    
    const optionPage = modalEl?.querySelector('.smart-import-option-page');
    if (optionPage) optionPage.style.display = 'none';

    // Show file preview
    const previewEl = modalEl?.querySelector('.smart-import-preview');
    const previewCard = modalEl?.querySelector('.preview-file-card');
    if (previewEl && previewCard) {
        previewEl.classList.add('visible');
        const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
        
        const size = file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(1)} KB`
            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        // Use the banner style for the preview card
        previewCard.innerHTML = `
            <div style="padding: 15px 15px 0 15px; width: 100%;">
                <div class="smart-import-banner" style="margin-bottom: 0; cursor: default; width: 100%;">
                    <div class="space-bg" style="border-radius: 25px;">
                        <div class="stars"></div>
                        <div class="stars2"></div>
                        <div class="stars3"></div>
                        <div class="shooting-star" style="top: 30%; right: 20%; animation-duration: 7s;"></div>
                    </div>
                    <div class="smart-import-banner-logo" style="background: rgba(255,255,255,0.08); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                        ${isImage 
                            ? `<img src="${URL.createObjectURL(file)}" style="width:100%;height:100%;object-fit:cover;">`
                            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
                        }
                    </div>
                    <div class="smart-import-banner-text" style="text-align: left; flex: 1;">
                        <span class="smart-import-banner-title" style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${file.name}</span>
                        <span style="font-size: 0.7rem; color: rgba(125, 249, 255, 0.85); font-weight: 500;">${size} • ${ext.toUpperCase()}</span>
                    </div>
                    <button class="smart-import-banner-arrow" id="remove-file-btn" style="width: 32px; height: 32px; background: rgba(255,50,80,0.15); border: 1px solid rgba(255,50,80,0.2); border-radius: 50%; color: #ff5050; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; cursor: pointer; position: relative; z-index: 10;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('remove-file-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.HapticsService) window.HapticsService.light();
            resetFileSelection();
        });
    }

    // Trigger analysis automatically
    triggerAnalysis();
}

async function triggerAnalysis() {
    if (!selectedFile) return;

    // Reset previous results
    const resultsEl = modalEl?.querySelector('.smart-import-results');
    resultsEl?.classList.remove('visible');
    const emptyEl = modalEl?.querySelector('.smart-import-empty');
    emptyEl?.classList.remove('visible');
    const footerEl = modalEl?.querySelector('.smart-import-footer');
    footerEl?.classList.remove('visible');

    showAurora(true, 'ANALYZING STATEMENT...');

    try {
        // Enforce a minimum 8-second cinematic scanning experience
        const [subs] = await Promise.all([
            analyzeFile(selectedFile),
            new Promise(resolve => setTimeout(resolve, 8000))
        ]);
        
        detectedSubs = subs;
        showAurora(false);
        await renderResults(detectedSubs);
    } catch (err) {
        showAurora(false);
        showToast('Analysis failed. Try again.', 'error');
        
        console.error('--- SMART IMPORT FAILURE ---');
        console.error('Error Object:', err);
        console.error('File Info:', selectedFile?.name, selectedFile?.type, selectedFile?.size);
        
        // On error, show the option page again instead of hero if they were in one
        const optionPage = modalEl?.querySelector('.smart-import-option-page');
        if (optionPage && optionPage.innerHTML.trim() !== '') {
            optionPage.style.display = 'flex';
        } else {
            const heroEl = modalEl?.querySelector('.smart-import-hero');
            if (heroEl) heroEl.style.display = 'flex';
        }
    }
}

function resetFileSelection() {
    selectedFile = null;
    detectedSubs = [];
    selectedSubs.clear();
    currentActiveOption = null;

    // Reset all scanning visuals
    showAurora(false);

    const heroEl = modalEl?.querySelector('.smart-import-hero');
    if (heroEl) heroEl.style.display = 'flex';

    const optionPage = modalEl?.querySelector('.smart-import-option-page');
    if (optionPage) optionPage.style.display = 'none';

    const previewEl = modalEl?.querySelector('.smart-import-preview');
    if (previewEl) {
        previewEl.classList.remove('visible');
        previewEl.style.display = 'none';
        const previewCard = previewEl.querySelector('.preview-file-card');
        if (previewCard) previewCard.innerHTML = '';
    }

    const statusEl = modalEl?.querySelector('.smart-import-status');
    statusEl?.classList.remove('visible');

    const resultsEl = modalEl?.querySelector('.smart-import-results');
    resultsEl?.classList.remove('visible');

    const emptyEl = modalEl?.querySelector('.smart-import-empty');
    emptyEl?.classList.remove('visible');

    const footerEl = modalEl?.querySelector('.smart-import-footer');
    if (footerEl) {
        footerEl.classList.remove('visible');
        footerEl.style.display = 'none';
    }

    // Reset file input
    const fileInput = modalEl?.querySelector('.smart-import-file-input');
    if (fileInput) {
        fileInput.value = '';
        fileInput.accept = '.jpg,.jpeg,.png,.webp,.pdf,.csv';
    }
}

window.triggerGmailScan = async function() {
    if (window.HapticsService) window.HapticsService.medium();
    // 1. UI Setup
    const optionPage = modalEl?.querySelector('.smart-import-option-page');
    if (optionPage) optionPage.style.display = 'none';

    showAurora(true, 'SCANNING GMAIL...');

    try {
        // Minimum 5-second cinematic delay for the scan
        const [subs] = await Promise.all([
            GmailSync.scanForSubscriptions(),
            new Promise(resolve => setTimeout(resolve, 5000))
        ]);

        detectedSubs = subs;
        showAurora(false);
        
        if (subs.length > 0) {
            await renderResults(detectedSubs);
        } else {
            showToast('No subscription emails found.', 'info');
            const heroEl = modalEl?.querySelector('.smart-import-hero');
            if (heroEl) heroEl.style.display = 'flex';
        }

    } catch (err) {
        showAurora(false);
        console.error('[SmartImport] Gmail Scan Failed:', err);
        
        if (err.message === 'GMAIL_AUTH_REQUIRED') {
            showToast('Gmail access required. Please sign in again.', 'error', 5000);
        } else if (err.message === 'GMAIL_API_ERROR') {
            showToast('Gmail connection unstable. Please try again.', 'error');
        } else if (err.message === 'AI_TIMEOUT_ERROR') {
            showToast('AI is taking too long. Try again with fewer emails.', 'error');
        } else {
            showToast('Failed to scan Gmail. Check connection.', 'error');
        }

        const heroEl = modalEl?.querySelector('.smart-import-hero');
        if (heroEl) heroEl.style.display = 'flex';
    }
}

// Option Pages rendering logic
window.showSmartImportOption = (type) => {
    if (window.HapticsService) window.HapticsService.light();
    currentActiveOption = type;
    const hero = document.getElementById('smart-import-drop-zone');
    const optionPage = document.getElementById('smart-import-option-page');
    const content = document.getElementById('smart-import-option-content');
    
    if (!hero || !optionPage || !content) return;
    
    let title = '';
    let desc = '';
    let btnText = 'Upload File';
    let steps = [];
    let acceptFormat = '.jpg,.jpeg,.png,.webp,.pdf,.csv';
    
    if (type === 'bank') {
        title = 'Import a Bank Statement';
        desc = 'Fast, secure, and automatic processing.';
        btnText = 'Upload File';
        acceptFormat = '.pdf,.csv';
        steps = [
            'Download your bank statement as a PDF or CSV',
            'Head over to Sublify Sync and click "Upload File"',
            'Drop in your PDF or CSV, we keep it fully secure',
            'Sublify Sync scans through every transaction automatically',
            'Your subscriptions show up, ready to track'
        ];
    } else if (type === 'gmail' || type === 'email') {
        currentActiveOption = 'gmail'; // Default to gmail behavior for combined view
        title = 'Email Sync';
        desc = 'Sync via API or search screenshots.';
        btnText = 'Start Gmail Scan';
        acceptFormat = '.jpg,.jpeg,.png,.webp';
        steps = [
            'Connect your Google account for automated scanning',
            'Or take screenshots of your email receipts',
            'Upload screenshots to scan them with AI Vision',
            'Subscriptions are detected and added instantly',
            'Your data is processed securely and never shared'
        ];
    } else {
        title = 'Import from an image';
        desc = 'Snap any receipt or statement.';
        btnText = 'Upload Image';
        acceptFormat = '.jpg,.jpeg,.png,.webp';
        steps = [
            'Grab your phone and open your receipt or statement',
            'Take a clear screenshot or photo of it',
            'Head over to Sublify Sync and click "Upload Image"',
            'Drop in your image and Sublify Sync reads every detail',
            'Your subscriptions are pulled out and added instantly'
        ];
    }
    
    // Set file input accept rules
    const fileInput = document.getElementById('smart-import-file-input');
    if (fileInput) fileInput.accept = acceptFormat;
    
    // Build numbered list
    let stepsHtml = steps.map((s, i) => `
        <div style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: rgba(125,249,255,0.1); color: #7df9ff; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; margin-top: 2px;">${i + 1}</div>
            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.4;">${s}</div>
        </div>
    `).join('');
    
    content.innerHTML = `
        <h1 style="font-size: 1.2rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 6px; letter-spacing: -0.01em;">${title}</h1>
        <p style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); margin-bottom: 24px;">${desc}</p>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px 20px 8px 20px; margin-bottom: 24px; min-height: 200px;">
            ${stepsHtml}
        </div>
    `;

    // Add/Update the fixed footer for the option page
    let footer = optionPage.querySelector('.smart-import-option-footer');
    if (!footer) {
        footer = document.createElement('div');
        footer.className = 'smart-import-option-footer';
        optionPage.appendChild(footer);
    }
    
    footer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
            <button class="smart-import-banner" onclick="window.triggerGmailScan()" style="margin-bottom: 0; width: 100%;">
                <div class="space-bg" style="border-radius: 25px;">
                    <div class="stars"></div>
                    <div class="stars2"></div>
                    <div class="stars3"></div>
                </div>
                <div class="smart-import-banner-logo" style="background: rgba(255,255,255,0.08); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" style="width: 22px; height: 22px;">
                </div>
                <div class="smart-import-banner-text" style="text-align: left;">
                    <span class="smart-import-banner-title" style="font-size: 0.95rem;">Start Gmail Scan</span>
                    <span style="font-size: 0.72rem; color: rgba(125, 249, 255, 0.85); font-weight: 500;">Securely scan your inbox</span>
                </div>
            </button>
            
            <button class="smart-import-banner" onclick="document.getElementById('smart-import-file-input').click()" style="margin-bottom: 0; width: 100%; background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.05);">
                <div class="smart-import-banner-logo" style="background: rgba(255,255,255,0.05); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <div class="smart-import-banner-text" style="text-align: left;">
                    <span class="smart-import-banner-title" style="font-size: 0.95rem;">Search Screenshots</span>
                    <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4); font-weight: 500;">Upload receipt images</span>
                </div>
            </button>
        </div>
        <p style="font-size: 0.65rem; color: rgba(255, 255, 255, 0.3); text-align: center; margin-top: 12px; line-height: 1.4; padding: 0 10px;">Sublify Sync is in beta and may occasionally miss or misread subscriptions. Your inbox data is processed securely, never shared, and your subscription data is stored safely with end-to-end encryption.</p>
    `;
    footer.classList.add('visible');
    footer.style.display = 'flex';
    
    hero.style.display = 'none';
    optionPage.style.display = 'flex';
};

// ─── Modal HTML ──────────────────────────────────────────────
function createSmartImportModal() {
    const el = document.createElement('div');
    el.id = 'smart-import-modal';
    el.className = 'smart-import-modal hidden';
    el.innerHTML = `
        <div class="smart-import-container">
            <!-- Header -->
            <div class="smart-import-header">
                <button id="smart-import-back" class="profile-page-back-btn" aria-label="Go back">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h2>Sublify Sync</h2>
            </div>

            <!-- File Preview (hidden initially) -->
            <div class="smart-import-preview" style="margin-bottom: 20px;">
                <div class="preview-file-card"></div>
            </div>

            <!-- Scrollable Body -->
            <div class="smart-import-body">

                <!-- Hero Section -->
                <div class="smart-import-hero" id="smart-import-drop-zone" style="text-align: left; padding: 15px; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start;">
                    <input type="file" class="smart-import-file-input" accept=".jpg,.jpeg,.png,.webp,.pdf,.csv" id="smart-import-file-input" style="display: none;">
                    
                    <h1 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; letter-spacing: -0.01em; line-height: 1.2; margin-bottom: 12px; max-width: 100%;">Find Every Subscription, Automatically</h1>
                    <p style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6); line-height: 1.35; margin-bottom: 15px; max-width: 100%;">Upload your bank statement, PDF, or connect your email. Sublify scans everything and adds your subscriptions for you. No manual entry, ever.</p>
                    
                    <div id="smart-import-offline-notice" class="smart-import-offline-notice">
                        <div class="offline-notice-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l22 22"/><path d="M16.72 11.06A5 5 0 0 1 15 20H6a5 5 0 0 1-5-5 5 5 0 0 1 4-4.9V10a5 5 0 0 1 .14-1.18M8 8V7a4 4 0 0 1 8 0v1h1a5 5 0 0 1 4.7 3.3"/></svg>
                        </div>
                        <div class="offline-notice-text">Sublify Sync requires an internet connection to process files with AI.</div>
                    </div>

                    <div id="smart-import-options-grid" style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 400px; margin-top: 10px;">
                        
                        <!-- Combined Option: Email Sync -->
                        <button class="smart-import-banner" aria-label="Email Sync" onclick="window.showSmartImportOption('gmail')" style="margin-bottom: 0;">
                            <div class="space-bg" style="border-radius: 25px;">
                                <div class="stars"></div>
                                <div class="stars2"></div>
                                <div class="stars3"></div>
                            </div>
                            <div class="smart-import-banner-logo" style="background: rgba(255,255,255,0.08); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" style="width: 22px; height: 22px;">
                            </div>
                            <div class="smart-import-banner-text" style="text-align: left;">
                                <span class="smart-import-banner-title" style="font-size: 0.95rem;">Email Sync</span>
                                <span style="font-size: 0.72rem; color: rgba(125, 249, 255, 0.85); font-weight: 500;">Automated scan or screenshots</span>
                            </div>
                            <div class="smart-import-banner-arrow" style="width: auto; background: none; border: none;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </button>
                        
                        <!-- Option 1: Bank Statement -->
                        <button class="smart-import-banner" aria-label="Import a Bank Statement" onclick="window.showSmartImportOption('bank')" style="margin-bottom: 0;">
                            <div class="space-bg" style="border-radius: 25px;">
                                <div class="stars"></div>
                                <div class="stars2"></div>
                                <div class="stars3"></div>
                            </div>
                            <div class="smart-import-banner-logo" style="background: rgba(255,255,255,0.08); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1);">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21v-8"/><path d="M19 21v-8"/><path d="M9 21v-8"/><path d="M15 21v-8"/><path d="M12 4 5 10h14Z"/></svg>
                            </div>
                            <div class="smart-import-banner-text" style="text-align: left;">
                                <span class="smart-import-banner-title" style="font-size: 0.95rem;">Import a Bank Statement</span>
                                <span style="font-size: 0.72rem; color: rgba(125, 249, 255, 0.85); font-weight: 500;">Securely scan PDFs or CSVs</span>
                            </div>
                            <div class="smart-import-banner-arrow" style="width: auto; background: none; border: none;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </button>
                        
                        <!-- Option 2: Import from Image -->
                        <button class="smart-import-banner" aria-label="Import from a image" onclick="window.showSmartImportOption('image')" style="margin-bottom: 0;">
                            <div class="space-bg" style="border-radius: 25px;">
                                <div class="stars"></div>
                                <div class="stars2"></div>
                                <div class="stars3"></div>
                            </div>
                            <div class="smart-import-banner-logo" style="background: rgba(255,255,255,0.08); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1);">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            </div>
                            <div class="smart-import-banner-text" style="text-align: left;">
                                <span class="smart-import-banner-title" style="font-size: 0.95rem;">Import from a image</span>
                                <span style="font-size: 0.72rem; color: rgba(125, 249, 255, 0.85); font-weight: 500;">Snap a receipt or screenshot</span>
                            </div>
                            <div class="smart-import-banner-arrow" style="width: auto; background: none; border: none;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </button>
                        
                    </div>

                    <!-- Live Stats Ticker (Wrapped in Banner) -->
                    <div class="smart-import-stats-ticker-wrapper">
                        <div class="smart-import-banner stats-banner" style="cursor: default; pointer-events: none; justify-content: center; padding: 30px 20px; flex-direction: column;">
                            <!-- Corner Screws -->
                            <div class="banner-screw tl"></div>
                            <div class="banner-screw tr"></div>
                            <div class="banner-screw bl"></div>
                            <div class="banner-screw br"></div>

                            <div class="space-bg" style="border-radius: 25px; opacity: 0.2;">
                                <div class="stars"></div>
                                <div class="stars2"></div>
                                <div class="stars3"></div>
                            </div>
                            
                            <!-- Drifting Logos Background -->
                            <div class="stats-drifting-logos">
                                <img src="/logos/netflix.com.png" class="drift-logo dl1" onerror="this.style.display='none'">
                                <img src="/logos/spotify.com.png" class="drift-logo dl2" onerror="this.style.display='none'">
                                <img src="/logos/apple.com.png" class="drift-logo dl3" onerror="this.style.display='none'">
                                <img src="/logos/adobe.com.png" class="drift-logo dl4" onerror="this.style.display='none'">
                                <img src="/logos/figma.com.png" class="drift-logo dl5" onerror="this.style.display='none'">
                                <img src="/logos/youtube.com.png" class="drift-logo dl6" onerror="this.style.display='none'">
                                <img src="/logos/disneyplus.com.png" class="drift-logo dl7" onerror="this.style.display='none'">
                                <img src="/logos/hbo.com.png" class="drift-logo dl8" onerror="this.style.display='none'">
                                <img src="/logos/amazon.com.png" class="drift-logo dl9" onerror="this.style.display='none'">
                                <img src="/logos/notion.so.png" class="drift-logo dl10" onerror="this.style.display='none'">
                            </div>

                            <div class="stats-ticker-content" style="z-index: 2;">
                                <span id="stats-ticker-count" class="stats-ticker-number">2,452</span>
                                <span class="stats-ticker-label">subscriptions detected this week</span>
                            </div>
                        </div>
                    </div>

                    <!-- App Branding Footer -->
                    <div class="smart-import-branding-footer">
                        <img src="/sublify-logo.png" alt="Sublify" class="branding-logo">
                        <span class="branding-version">v1.2.9</span>
                    </div>
                </div>

                <!-- Option Page (hidden initially) -->
                <div class="smart-import-option-page" id="smart-import-option-page" style="display: none; flex-direction: column; padding: 20px 15px; align-items: flex-start; text-align: left;">
                    <div id="smart-import-option-content" style="width: 100%;"></div>
                </div>



                <!-- Empty State -->
                <div class="smart-import-empty">
                    <div class="smart-import-empty-icon">🔍</div>
                    <div class="smart-import-empty-text">No subscriptions detected.<br>Try a different file or a clearer screenshot.</div>
                </div>

                <!-- Results -->
                <div class="smart-import-results">
                    <div class="results-list"></div>
                </div>

            </div>
             
             <!-- Aurora Scanning Visual (shown during analysis) -->
             <div class="smart-import-aurora-section">
                <div class="smart-import-logo-scanner">
                    <img src="/sublify-logo.png" alt="Sublify" class="scanner-logo">
                </div>
                <div class="aurora-container">
                    <!-- WebGL Canvas will be injected here -->
                </div>
                <!-- Status text removed per request for a cleaner experience -->
                <span class="logo-beta-tag">BETA</span>
             </div>




            <!-- Footer -->
            <div class="smart-import-footer">
                <button class="select-all-btn cancel-import-btn">Cancel</button>
                <button class="import-selected-btn" disabled>select subs</button>
                <p style="font-size: 0.65rem; color: rgba(255, 255, 255, 0.3); text-align: center; margin-top: 12px; line-height: 1.4; width: 100%; grid-column: span 2;">Sublify Sync is in beta and may occasionally miss or misread subscriptions. Your inbox data is processed securely, never shared, and your subscription data is stored safely with end-to-end encryption.</p>
            </div>
        </div>
    `;

    return el;
}

// ─── Aurora Helper ──────────────────────────────────────────
function showAurora(show, message = 'ANALYZING...') {
    const auroraEl = modalEl?.querySelector('.smart-import-aurora-section');
    const auroraContainer = modalEl?.querySelector('.aurora-container');
    const headerEl = modalEl?.querySelector('.smart-import-header');
    const bodyEl = modalEl?.querySelector('.smart-import-body');
    const footerEl = modalEl?.querySelector('.smart-import-footer');
    const previewEl = modalEl?.querySelector('.smart-import-preview');
    const removeFileBtn = modalEl?.querySelector('#remove-file-btn');

    if (show) {
        if (auroraEl) {
            auroraEl.classList.add('visible');
            auroraEl.style.zIndex = '100'; 
        }
        
        // Allow the "Sublify Sync" title to be visible, but hide the back button for cinematic focus
        if (headerEl) {
            headerEl.style.opacity = '1';
            const backBtn = headerEl.querySelector('.profile-page-back-btn');
            if (backBtn) {
                backBtn.style.display = 'none';
            }
            const title = headerEl.querySelector('h2');
            if (title) {
                title.style.textAlign = 'center';
            }
        }
        if (bodyEl) bodyEl.style.display = 'none';
        if (footerEl) footerEl.style.display = 'none';
        if (removeFileBtn) removeFileBtn.style.display = 'none';
        
        // Keep the preview visible during scanning for context
        if (previewEl && selectedFile) {
            previewEl.style.display = 'block';
            previewEl.style.position = 'relative';
            previewEl.style.zIndex = '200'; // Above Aurora
        }

        if (auroraContainer) {
            if (activeAurora) activeAurora.destroy();
            activeAurora = initAurora(auroraContainer, {
                colorStops: ["#2b28e3", "#8400ff", "#3100f7"],
                blend: 1,
                amplitude: 1.0,
                speed: 1
            });
        }
    } else {
        if (auroraEl) {
            auroraEl.classList.remove('visible');
            auroraEl.style.zIndex = '';
        }
        
        // Restore all UI elements
        if (headerEl) {
            headerEl.style.opacity = '1';
            const backBtn = headerEl.querySelector('.profile-page-back-btn');
            if (backBtn) {
                backBtn.style.display = 'flex';
            }
            const title = headerEl.querySelector('h2');
            if (title) {
                title.style.textAlign = 'right';
            }
        }
        if (bodyEl) bodyEl.style.display = 'flex';
        if (footerEl) {
            // Only show main footer if we have results or are on the hero page
            const hasResults = modalEl?.querySelector('.smart-import-results').classList.contains('visible');
            const isHero = modalEl?.querySelector('.smart-import-hero').style.display !== 'none';
            if (hasResults || isHero) {
                footerEl.style.display = 'flex';
                footerEl.classList.add('visible');
            }
        }
        if (removeFileBtn) removeFileBtn.style.display = 'flex';
        
        if (previewEl) {
            previewEl.style.zIndex = '';
        }

        if (activeAurora) {
            activeAurora.destroy();
            activeAurora = null;
        }
    }
}

// ─── Open / Close ─────────────────────────────────────────────
export function openSmartImport() {
    if (!modalEl) return;
    resetFileSelection();
    modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSmartImport() {
    if (!modalEl) return;
    modalEl.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(resetFileSelection, 400);
}

// ─── Init ─────────────────────────────────────────────────────
export function initSmartImport() {
    // Create and inject modal
    modalEl = createSmartImportModal();
    document.body.appendChild(modalEl);

    // Initial Connectivity Check
    updateConnectivityUI();
    window.addEventListener('online', updateConnectivityUI);
    window.addEventListener('offline', updateConnectivityUI);
    
    // Start Ticker Animation
    initStatsTicker();

    // Back button
    document.getElementById('smart-import-back')?.addEventListener('click', () => {
        if (window.HapticsService) window.HapticsService.light();
        const optionPage = modalEl.querySelector('.smart-import-option-page');
        const heroEl = modalEl.querySelector('.smart-import-hero');
        
        // If viewing an option page with no deep analysis active
        if (optionPage && optionPage.style.display === 'flex' && !selectedFile) {
            optionPage.style.display = 'none';
            if (heroEl) heroEl.style.display = 'flex';
            return;
        }
        
        // If at the main hero root, completely close modal
        if (heroEl && heroEl.style.display === 'flex' && !selectedFile) {
            closeSmartImport();
            return;
        }
        
        // If deeper in results/analysis flow, just reset back to hero root
        resetFileSelection();
    });

    // File input
    const fileInput = document.getElementById('smart-import-file-input');
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelected(file);
    });

    // Footer Buttons
    modalEl.querySelector('.cancel-import-btn')?.addEventListener('click', () => {
        if (window.HapticsService) window.HapticsService.light();
        resetFileSelection();
    });

    modalEl.querySelector('.import-selected-btn')?.addEventListener('click', () => {
        if (window.HapticsService) window.HapticsService.success();
        importSelected();
    });

    // Drag & Drop
    const dropZone = document.getElementById('smart-import-drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer?.files?.[0];
            if (file) handleFileSelected(file);
        });
    }

    // Select All button
    modalEl.querySelector('.select-all-btn')?.addEventListener('click', () => {
        const cards = modalEl.querySelectorAll('.result-sub-card');
        const allSelected = selectedSubs.size === detectedSubs.length;

        if (allSelected) {
            selectedSubs.clear();
            cards.forEach(c => c.classList.remove('selected'));
        } else {
            detectedSubs.forEach((_, i) => selectedSubs.add(i));
            cards.forEach(c => c.classList.add('selected'));
        }
        updateImportBtn();
        updateSelectAllBtn();
    });

    // Expose globally
    window.openSmartImport = openSmartImport;
    window.closeSmartImport = closeSmartImport;
}

function updateConnectivityUI() {
    if (!modalEl) return;
    const isOnline = navigator.onLine;
    const notice = modalEl.querySelector('#smart-import-offline-notice');
    const banners = modalEl.querySelectorAll('.smart-import-banner');
    
    if (notice) {
        notice.style.display = isOnline ? 'none' : 'flex';
    }
    
    banners.forEach(banner => {
        if (!isOnline) {
            banner.classList.add('disabled');
        } else {
            banner.classList.remove('disabled');
        }
    });
}

function initStatsTicker() {
    const countEl = modalEl?.querySelector('#stats-ticker-count');
    if (!countEl) return;

    // Set static count as requested
    countEl.innerHTML = "2,452";
    countEl.style.color = "#ffffff";
    
    // Interval removed to prevent number changes
}
