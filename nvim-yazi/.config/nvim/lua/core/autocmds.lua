local augroup = vim.api.nvim_create_augroup
local autocmd = vim.api.nvim_create_autocmd

-- 1. 他にバッファがなくなった時、自動的にツリーを閉じてNeovimを終了する
autocmd("BufEnter", {
  group = augroup("NvimTreeClose", { clear = true }),
  pattern = "*",
  callback = function()
    local layout = vim.api.nvim_call_function("winlayout", {})
    if layout[1] == "leaf" and vim.bo[vim.fn.win_getid(layout[2])].filetype == "NvimTree" and layout[3] == nil then
      vim.cmd("confirm quit")
    end
  end
})

-- 2. 起動時に自動でNvimTreeを開く
autocmd({ "VimEnter" }, {
  group = augroup("NvimTreeOpen", { clear = true }),
  callback = function(data)
    require("nvim-tree.api").tree.open()
    local is_real_file = vim.fn.filereadable(data.file) == 1
    if is_real_file then
      vim.cmd("wincmd l")
    end
  end
})

-- カーソルが止まってからポップアップが出るまでの時間（ミリ秒）
vim.o.updatetime = 150

-- カーソルホールド時に診断情報を表示
autocmd("CursorHold", {
  buffer = bufnr,
  callback = function()
    local opts = {
      focusable = false,
      close_events = { "CursorMoved", "CursorMovedI", "BufLeave" },
      focus = false,
    }
    vim.diagnostic.open_float(nil, opts)
  end
})
