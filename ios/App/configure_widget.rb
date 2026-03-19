require 'xcodeproj'

project_path = 'App.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# 1. Add WidgetExtension target
target_name = 'WidgetExtension'
app_bundle_id = 'com.amikonamoto.app'
widget_bundle_id = 'com.amikonamoto.app.widget'

# Check if target already exists
if project.targets.find { |t| t.name == target_name }
  puts "Target #{target_name} already exists."
  exit 0
end

# Create target
widget_target = project.new_target(:app_extension, target_name, :ios, '15.0')
widget_target.name = target_name
widget_target.product_name = target_name

# 2. Add files
widget_group = project.main_group.find_subpath('WidgetExtension', true)
widget_group.set_source_tree('<group>')

# Add files to the group and target (exclude Info.plist from build phases)
file_names = ['WidgetExtension.swift', 'WidgetExtensionBundle.swift']
file_names.each do |file_name|
  file_ref = widget_group.new_file(File.join('WidgetExtension', file_name))
  widget_target.add_file_references([file_ref])
end
# Keep Info.plist reference in the group but not in build phases
widget_group.new_file(File.join('WidgetExtension', 'Info.plist'))

# 3. Build settings
widget_target.build_configurations.each do |config|
  config.build_settings['PRODUCT_NAME'] = target_name
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = widget_bundle_id
  config.build_settings['INFOPLIST_FILE'] = 'WidgetExtension/Info.plist'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks'
  config.build_settings['SKIP_INSTALL'] = 'YES'
  config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
  config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
  config.build_settings['CODE_SIGN_IDENTITY'] = ''
  config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'YES'
  config.build_settings['MARKETING_VERSION'] = '1.0'
  config.build_settings['CURRENT_PROJECT_VERSION'] = '1'
end

# 4. Create Entitlements file
entitlements_content = <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>group.com.amikonamoto.app</string>
	</array>
</dict>
</plist>
PLIST

File.write('WidgetExtension/WidgetExtension.entitlements', entitlements_content)

# 5. Add dependency to main App target
main_target = project.targets.find { |t| t.name == 'App' }
main_target.add_dependency(widget_target)

# 6. Add to Embed App Extensions build phase
embed_extensions_phase = main_target.copy_files_build_phases.find { |p| p.name == 'Embed App Extensions' } || 
                         main_target.new_copy_files_build_phase('Embed App Extensions')
embed_extensions_phase.symbol_dst_subfolder_spec = :plug_ins
embed_extensions_phase.add_file_reference(widget_target.product_reference)

# Save project
project.save
puts "Successfully added WidgetExtension target to App.xcodeproj"
