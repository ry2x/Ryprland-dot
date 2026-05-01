-- keymap
local keymap = vim.keymap

keymap.set({ 'n', 't' }, '<C-;>', function()
  local cwd = vim.fn.getcwd()
  vim.fn.jobstart(string.format("kitty -d '%s' --title TempTerminal", cwd), {
    detach = true
  })
end, { desc = "Spawn Floating Kitty on top" })

-- ファイルツリーの開閉 (Space + e)
keymap.set('n', '<leader>e', ':NvimTreeToggle<CR>', { silent = true })

-- 1. ウィンドウ間の移動を Ctrl + h/j/k/l で行う (Treeからエディタへ戻るのもこれ)
keymap.set('n', '<C-h>', '<C-w>h', { desc = "Go to Left Window" })
keymap.set('n', '<C-l>', '<C-w>l', { desc = "Go to Right Window" })
keymap.set('n', '<C-j>', '<C-w>j', { desc = "Go to Lower Window" })
keymap.set('n', '<C-k>', '<C-w>k', { desc = "Go to Upper Window" })

-- 2. タブ（バッファ）の切り替え
-- Alt + Tab は端末で奪われることが多いため、 Shift + h / l に割り当てると高速です
keymap.set('n', '<S-l>', ':bnext<CR>', { silent = true, desc = "Next Tab" })
keymap.set('n', '<S-h>', ':bprev<CR>', { silent = true, desc = "Previous Tab" })

-- 2. タブ（バッファ）の切り替え
-- Alt + Tab は端末で奪われることが多いため、 Shift + h / l に割り当てると高速です
keymap.set('n', '<S-l>', ':bnext<CR>', { silent = true, desc = "Next Tab" })
keymap.set('n', '<S-h>', ':bprev<CR>', { silent = true, desc = "Previous Tab" })

-- 3. 開いているタブを閉じる
keymap.set('n', '<leader>x', ':Bdelete<CR>', { desc = "Close Current Tab" })

-- Ctrl + s で保存 (Insertモード、Normalモード両方)
keymap.set({ 'n', 'i', 'v' }, '<C-s>', '<Esc>:w<CR>', { desc = "Save file" })

-- Space + q で「全てのファイルを保存して終了」
keymap.set('n', '<leader>q', ':xa<CR>', { desc = "Save all and Quit Neovim" })

-- スペース + k で診断情報を表示する
keymap.set('n', '<space>k', vim.diagnostic.open_float)
