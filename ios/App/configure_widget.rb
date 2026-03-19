require 'xcodeproj'

project_path = 'App.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# 1. Add WidgetExtension target
target_name = 'WidgetExtension'
app_bundle_id = 'com.amikonamoto.app'
widget_bundle_id = 'com.amikonamoto.app.widget'

# Find or create target
widget_target = project.targets.find { |t| t.name == target_name } || 
                project.new_target(:app_extension, target_name, :ios, '17.0')
widget_target.name = target_name
widget_target.product_name = target_name

# 2. Add files
widget_group = project.main_group.find_subpath('WidgetExtension', true)
widget_group.set_source_tree('<group>')

# Add files to the group and target
file_names = ['WidgetExtension.swift', 'WidgetExtensionBundle.swift']
file_names.each do |file_name|
  unless widget_group.files.find { |f| f.name == file_name }
    file_ref = widget_group.new_file(File.join('WidgetExtension', file_name))
    widget_target.add_file_references([file_ref])
  end
end

# Keep Info.plist reference in the group
unless widget_group.files.find { |f| f.name == 'Info.plist' }
  widget_group.new_file(File.join('WidgetExtension', 'Info.plist'))
end

# 3. Build settings for Widget
widget_target.build_configurations.each do |config|
  config.build_settings['PRODUCT_NAME'] = target_name
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = widget_bundle_id
  config.build_settings['INFOPLIST_FILE'] = 'WidgetExtension/Info.plist'
  config.build_settings['GENERATE_INFOPLIST_FILE'] = 'NO'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1' # iPhone only for better validation
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks'
  config.build_settings['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'YES'
  config.build_settings['SKIP_INSTALL'] = 'YES'
  config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
  config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
  config.build_settings['CODE_SIGN_IDENTITY'] = ''
  config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'YES'
  config.build_settings['MARKETING_VERSION'] = '1.0'
  config.build_settings['CURRENT_PROJECT_VERSION'] = '1'
  config.build_settings['VALIDATE_PRODUCT'] = 'NO'
  config.build_settings['ENABLE_BITCODE'] = 'NO'
  config.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = 'AppIcon'
end

# 4. Update Main App settings to match iOS 17 baseline
main_target = project.targets.find { |t| t.name == 'App' }
main_target.build_configurations.each do |config|
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'
  config.build_settings['VALIDATE_PRODUCT'] = 'NO'
end

# 5. Dependencies
unless main_target.dependencies.find { |d| d.target&.name == widget_target.name }
  main_target.add_dependency(widget_target)
end

# 6. Embed App Extensions build phase
embed_extensions_phase = main_target.copy_files_build_phases.find { |p| p.name == 'Embed App Extensions' } || 
                         main_target.new_copy_files_build_phase('Embed App Extensions')
embed_extensions_phase.symbol_dst_subfolder_spec = :plug_ins
unless embed_extensions_phase.files_references.find { |f| f.file_ref&.path&.include?(target_name) }
  embed_extensions_phase.add_file_reference(widget_target.product_reference)
end

# Save project
project.save
puts "Successfully configured WidgetExtension target for iOS 17 in App.xcodeproj"
