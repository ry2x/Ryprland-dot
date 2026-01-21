-- Base Options
vim.g.mapleader = " "
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.expandtab = true
vim.opt.shiftwidth = 4
vim.opt.tabstop = 4
vim.opt.smartindent = true
vim.opt.termguicolors = true
vim.opt.clipboard = "unnamedplus"
vim.opt.cmdheight = 0

-- Set PKGBUILD's filetype to shell scripts
vim.api.nvim_create_autocmd({ "BufNewFile", "BufRead" }, {
  pattern = "PKGBUILD",
  command = "set filetype=sh",
})

-- Auto format setting
vim.api.nvim_create_autocmd("BufWritePre", {
  pattern = { "*.rs", "*.json", "*.lua" },
  callback = function()
    vim.lsp.buf.format({ async = false })
  end,
})
