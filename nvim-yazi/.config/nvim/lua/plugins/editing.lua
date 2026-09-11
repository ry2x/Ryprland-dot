return {
    {
        "windwp/nvim-autopairs",
        event = "InsertEnter",
        opts = {},
    },
    {
        "nvim-treesitter/nvim-treesitter",
        lazy = false,
        build = ":TSUpdate",
        config = function()
            local languages = {
                "bash",
                "css",
                "html",
                "javascript",
                "json",
                "lua",
                "markdown",
                "markdown_inline",
                "rust",
                "tsx",
                "typescript",
                "vim",
                "vimdoc",
            }

            require("nvim-treesitter").install(languages)

            vim.api.nvim_create_autocmd("FileType", {
                group = vim.api.nvim_create_augroup("UserTreesitter", { clear = true }),
                pattern = {
                    "css",
                    "html",
                    "javascript",
                    "javascriptreact",
                    "json",
                    "jsonc",
                    "lua",
                    "markdown",
                    "rust",
                    "sh",
                    "typescript",
                    "typescriptreact",
                    "vim",
                    "vimdoc",
                },
                callback = function()
                    pcall(vim.treesitter.start)
                end,
            })
        end,
    },
}
