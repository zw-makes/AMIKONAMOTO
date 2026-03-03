import dns from 'dns';
const resolver = new dns.Resolver();

const domain = 'ptueakygbjohifkscplk.supabase.co';

console.log(`--- DIAGNOSTIC REPORT FOR ${domain} ---`);

// 1. Check System DNS (The one providing the fake IP)
dns.resolve4(domain, (err, addresses) => {
    if (err) {
        console.log('System DNS Error:', err.message);
    } else {
        console.log('SYSTEM DNS IP (Likely Fake):', addresses);
    }
});

// 2. Check Google DNS (The real one)
resolver.setServers(['8.8.8.8']);
resolver.resolve4(domain, (err, addresses) => {
    if (err) {
        console.log('Google DNS (8.8.8.8) Error:', err.message);
    } else {
        console.log('GOOGLE DNS IP (REAL):', addresses);
        console.log('\n--- VERDICT ---');
        console.log('If these two IPs are different, your ISP (Jio) is sending your packets to a dead-end.');
    }
});
