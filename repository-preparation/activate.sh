# Source this file in the terminal session used for repository work.
# It changes only that shell session; it does not edit your shell profile.
if [ -n "${ZSH_VERSION:-}" ]; then
  _reel_prep_file="${(%):-%N}"
else
  _reel_prep_file="${BASH_SOURCE[0]}"
fi
_reel_prep_dir="$(cd "$(dirname "${_reel_prep_file}")" && pwd)"
export PATH="${_reel_prep_dir}/bin:~/.local/bin:/opt/homebrew/bin:${PATH}"
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
export PLAYWRIGHT_CHROME="${CHROME_PATH}"
export PUPPETEER_EXECUTABLE_PATH="${CHROME_PATH}"
unset _reel_prep_dir _reel_prep_file
