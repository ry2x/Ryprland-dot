return {
  {
    "neovim/nvim-lspconfig",
    dependencies = {
      "williamboman/mason.nvim", "williamboman/mason-lspconfig.nvim"
    },
    config = function()
      require("mason").setup()
      require("mason-lspconfig").setup({
        ensure_installed = { "rust_analyzer", "jsonls", "bashls" }
      })
      if vim.lsp.config then
        vim.lsp.enable('jsonls')
        vim.lsp.enable('bashls')
      else
        -- フォールバック
        local lspconfig = require('lspconfig')
        lspconfig.jsonls.setup({})
        lspconfig.bashls.setup({})
      end

      vim.api.nvim_create_autocmd('LspAttach', {
        group = vim.api.nvim_create_augroup('UserLspConfig', {}),
        callback = function(ev)
          local opts = { buffer = ev.buf }
          local keymap = vim.keymap
          local lsp = vim.lsp

          -- [gd] Definition: 定義へジャンプ
          keymap.set('n', 'gd', lsp.buf.definition, opts)

          -- [gr] References: どこで使われているかを一覧表示
          -- Telescopeを使っている場合は、以下のように書くとリッチな画面になります
          keymap.set('n', 'gr', function()
            require('telescope.builtin').lsp_references()
          end, opts)

          -- [gi] Implementation: トレイトの具体的な実装箇所へジャンプ
          keymap.set('n', 'gi', function()
            require('telescope.builtin').lsp_implementations()
          end, opts)

          -- [K] Hover: 型情報やドキュメントをポップアップ表示
          keymap.set('n', 'K', lsp.buf.hover, opts)
          -- [<leader>rn] Rename: 変数名や関数名の一括置換（Rust開発では必須！）
          keymap.set('n', '<leader>rn', lsp.buf.rename, opts)

          -- [<leader>ca] Code Action: 修正案の提示（インポートの自動追加など）
          keymap.set('n', '<leader>ca', lsp.buf.code_action, opts)

          -- [gD] Type Definition: 型の定義へ
          keymap.set('n', 'gD', lsp.buf.type_definition, opts)

          if lsp.inlay_hint then
            lsp.inlay_hint.enable(true, { bufnr = ev.buf })
          end
        end
      })
    end
  },   -- Rust支援 (rustaceanvim)
  {
    "mrcjkb/rustaceanvim",
    version = "^5",
    ft = { "rust" },
    server = {
      ['rust-analyzer'] = {
        -- 手動ビルドと干渉しないようディレクトリを分ける
        cargo = { targetDir = "target/rust-analyzer" }
      }
    }
  }
}
