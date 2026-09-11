local keymap = vim.keymap

keymap.set({ "n", "t" }, "<C-;>", function()
    local cwd = vim.fn.getcwd()
    vim.fn.jobstart({ "kitty", "-d", cwd, "--title", "TempTerminal" }, {
        detach = true,
    })
end, { desc = "Spawn floating Kitty" })

keymap.set("n", "<leader>e", "<cmd>Explore<cr>", { desc = "Open file explorer" })

keymap.set("n", "<C-h>", "<C-w>h", { desc = "Go to left window" })
keymap.set("n", "<C-l>", "<C-w>l", { desc = "Go to right window" })
keymap.set("n", "<C-j>", "<C-w>j", { desc = "Go to lower window" })
keymap.set("n", "<C-k>", "<C-w>k", { desc = "Go to upper window" })

keymap.set("n", "<S-l>", "<cmd>bnext<cr>", { desc = "Next buffer" })
keymap.set("n", "<S-h>", "<cmd>bprevious<cr>", { desc = "Previous buffer" })
keymap.set("n", "<leader>x", "<cmd>bdelete<cr>", { desc = "Delete current buffer" })

keymap.set({ "n", "i", "v" }, "<C-s>", "<Esc><cmd>write<cr>", { desc = "Save file" })
keymap.set("n", "<leader>q", "<cmd>xitall<cr>", { desc = "Save all and quit" })
keymap.set("n", "<leader>k", vim.diagnostic.open_float, { desc = "Show diagnostic" })

keymap.set("i", "<Tab>", function()
    return vim.fn.pumvisible() == 1 and "<C-n>" or "<Tab>"
end, { expr = true, desc = "Select next completion item" })

keymap.set("i", "<S-Tab>", function()
    return vim.fn.pumvisible() == 1 and "<C-p>" or "<S-Tab>"
end, { expr = true, desc = "Select previous completion item" })

keymap.set("i", "<CR>", function()
    return vim.fn.pumvisible() == 1 and "<C-y>" or "<CR>"
end, { expr = true, desc = "Confirm completion item" })
