#!/bin/zsh
set -eu

project_dir="$(cd "$(dirname "$0")" && pwd)"
plugins_dir="/Applications/HBuilderX.app/Contents/HBuilderX/plugins"
compiler_dir="$plugins_dir/uniapp-cli-vite"
node_bin="$plugins_dir/node/node"

if [[ ! -x "$node_bin" || ! -f "$compiler_dir/node_modules/@dcloudio/vite-plugin-uni/bin/uni.js" ]]; then
  print -u2 'HBuilderX Vue3 compiler not found. Install the uniapp Vue3 compiler in HBuilderX first.'
  exit 1
fi

export UNI_INPUT_DIR="$project_dir"
export UNI_OUTPUT_DIR="$project_dir/unpackage/dist/dev/h5"
cd "$compiler_dir"
print 'Preview: http://localhost:8081/#/'
print 'Keep this terminal open while using the preview. Press Ctrl+C to stop.'
exec "$node_bin" node_modules/@dcloudio/vite-plugin-uni/bin/uni.js -p h5 --host 127.0.0.1 --port 8081 --strictPort
