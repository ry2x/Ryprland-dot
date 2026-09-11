return {
    {
        "stevearc/conform.nvim",
        event = { "BufWritePre" },
        cmd = { "ConformInfo" },
        keys = {
            {
                "<leader>f",
                function()
                    require("conform").format({
                        async = true,
                        lsp_format = "fallback",
                    })
                end,
                desc = "Format buffer",
            },
        },
        opts = {
            formatters_by_ft = {
                css = { "prettier" },
                html = { "prettier" },
                javascript = { "prettier" },
                javascriptreact = { "prettier" },
                json = { "prettier" },
                jsonc = { "prettier" },
                lua = { "stylua" },
                markdown = { "prettier" },
                rust = { "rustfmt" },
                scss = { "prettier" },
                sh = { "shfmt" },
                typescript = { "prettier" },
                typescriptreact = { "prettier" },
            },
            default_format_opts = {
                lsp_format = "fallback",
            },
            format_on_save = {
                timeout_ms = 2000,
                lsp_format = "fallback",
            },
            notify_on_error = true,
        },
    },
}
