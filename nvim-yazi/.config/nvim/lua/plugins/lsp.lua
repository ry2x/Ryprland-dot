return {
    {
        "neovim/nvim-lspconfig",
        dependencies = {
            "williamboman/mason.nvim",
            "williamboman/mason-lspconfig.nvim",
        },
        config = function()
            require("mason").setup()
            require("mason-lspconfig").setup({
                ensure_installed = {
                    "bashls",
                    "cssls",
                    "html",
                    "jsonls",
                    "lua_ls",
                    "rust_analyzer",
                    "ts_ls",
                },
                automatic_enable = {
                    exclude = { "rust_analyzer" },
                },
            })

            vim.diagnostic.config({
                severity_sort = true,
                signs = true,
                underline = true,
                update_in_insert = false,
                virtual_text = false,
            })

            vim.api.nvim_create_autocmd("LspAttach", {
                group = vim.api.nvim_create_augroup("UserLspConfig", { clear = true }),
                callback = function(event)
                    local client = assert(vim.lsp.get_client_by_id(event.data.client_id))
                    local opts = { buffer = event.buf }

                    if client:supports_method("textDocument/completion") then
                        vim.lsp.completion.enable(true, client.id, event.buf, {
                            autotrigger = true,
                        })
                    end

                    vim.keymap.set("n", "gd", vim.lsp.buf.definition, opts)
                    vim.keymap.set("n", "gr", function()
                        require("telescope.builtin").lsp_references()
                    end, opts)
                    vim.keymap.set("n", "gi", function()
                        require("telescope.builtin").lsp_implementations()
                    end, opts)
                    vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
                    vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts)
                    vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, opts)
                    vim.keymap.set("n", "gD", vim.lsp.buf.type_definition, opts)

                    if vim.lsp.inlay_hint then
                        vim.lsp.inlay_hint.enable(true, { bufnr = event.buf })
                    end
                end,
            })
        end,
    },
    {
        "mrcjkb/rustaceanvim",
        version = "^5",
        lazy = false,
        init = function()
            vim.g.rustaceanvim = {
                server = {
                    default_settings = {
                        ["rust-analyzer"] = {
                            cargo = {
                                targetDir = "target/rust-analyzer",
                            },
                        },
                    },
                },
            }
        end,
    },
}
