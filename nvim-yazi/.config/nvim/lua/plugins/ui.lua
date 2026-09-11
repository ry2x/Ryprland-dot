return {
    {
        "rebelot/kanagawa.nvim",
        lazy = false,
        priority = 1000,
        config = function()
            vim.cmd.colorscheme("kanagawa")
        end,
    },
    {
        "nvim-lualine/lualine.nvim",
        event = "VeryLazy",
        dependencies = { "nvim-tree/nvim-web-devicons" },
        opts = {
            options = {
                theme = "kanagawa",
                component_separators = { left = "", right = "" },
                section_separators = { left = "", right = "" },
                globalstatus = true,
            },
            sections = {
                lualine_a = { "mode" },
                lualine_b = { "branch", "diff", "diagnostics" },
                lualine_c = { { "filename", path = 1 } },
                lualine_x = { "encoding", "fileformat", "filetype" },
                lualine_y = { "progress" },
                lualine_z = { "location" },
            },
        },
    },
    {
        "lewis6991/gitsigns.nvim",
        event = { "BufReadPre", "BufNewFile" },
        opts = {
            signs = {
                add = { text = "┃" },
                change = { text = "┃" },
                delete = { text = "_" },
                topdelete = { text = "‾" },
                changedelete = { text = "~" },
                untracked = { text = "┆" },
            },
            signcolumn = true,
            numhl = false,
            on_attach = function(bufnr)
                local gitsigns = require("gitsigns")

                local function map(mode, lhs, rhs, opts)
                    opts = opts or {}
                    opts.buffer = bufnr
                    vim.keymap.set(mode, lhs, rhs, opts)
                end

                map("n", "<leader>hp", gitsigns.preview_hunk, { desc = "Preview Git hunk" })
                map("n", "]c", function()
                    if vim.wo.diff then
                        return "]c"
                    end
                    vim.schedule(gitsigns.next_hunk)
                    return "<Ignore>"
                end, { expr = true, desc = "Next Git hunk" })
                map("n", "[c", function()
                    if vim.wo.diff then
                        return "[c"
                    end
                    vim.schedule(gitsigns.prev_hunk)
                    return "<Ignore>"
                end, { expr = true, desc = "Previous Git hunk" })
                map("n", "<leader>hr", gitsigns.reset_hunk, { desc = "Reset Git hunk" })
                map("n", "<leader>hs", gitsigns.stage_hunk, { desc = "Stage Git hunk" })
            end,
        },
    },
}
