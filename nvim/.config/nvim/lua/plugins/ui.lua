return {
  {
    "rebelot/kanagawa.nvim",
    priority = 1000,
    config = function() vim.cmd.colorscheme("kanagawa") end
  }, {
  "nvim-lualine/lualine.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  config = function()
    require('lualine').setup({
      options = {
        theme = 'kanagawa',             -- カラースキームと統一
        component_separators = { left = '', right = '' },
        section_separators = { left = '', right = '' },
        globalstatus = true
      },
      sections = {
        lualine_a = { 'mode' },
        lualine_b = { 'branch', 'diff', 'diagnostics' },
        lualine_c = { { 'filename', path = 1 } },
        lualine_x = { 'encoding', 'fileformat', 'filetype' },
        lualine_y = { 'progress' },
        lualine_z = { 'location' }
      }
    })
  end
}, {
  'akinsho/bufferline.nvim',
  version = "*",
  dependencies = 'nvim-tree/nvim-web-devicons',
  config = function()
    require("bufferline").setup({
      options = {
        mode = "buffers",
        diagnostics = "nvim_lsp",
        offsets = {
          {
            filetype = "NvimTree",
            text = "File Explorer",
            text_align = "left",
            separator = true
          }
        }
      }
    })
  end
},     -- メッセージのモダン化 (noice.nvim)
  {
    "folke/noice.nvim",
    event = "VeryLazy",
    dependencies = { "MunifTanjim/nui.nvim", "rcarriga/nvim-notify" },
    config = function()
      require("noice").setup({
        messages = {
          enabled = true,           -- エラーメッセージなどもポップアップにする
          view = "mini"             -- 右下に小さく出す
        },
        popupmenu = { enabled = true },
        lsp = {
          -- LSPのメッセージをNoiceで処理する
          override = {
            ["vim.lsp.util.convert_input_to_markdown_lines"] = true,
            ["vim.lsp.util.stylize_markdown"] = true,
            ["cmp.entry.get_documentation"] = true
          }
        },
        presets = {
          bottom_search = false,            -- 検索バーを下に置くか
          command_palette = true,           -- コマンド入力をパレット風にする
          long_message_to_split = true,
          inc_rename = false,               -- インクリメンタルリネームの利用
          lsp_doc_border = true             -- LSPヘルプに枠線をつける
        }
      })
    end
  },   -- Gitの変更を左端に表示 (gitsigns.nvim)
  {
    "lewis6991/gitsigns.nvim",
    config = function()
      require('gitsigns').setup({
        signs = {
          add = { text = '┃' },
          change = { text = '┃' },
          delete = { text = '_' },
          topdelete = { text = '‾' },
          changedelete = { text = '~' },
          untracked = { text = '┆' }
        },
        -- 行番号自体の色を変える設定（お好みで）
        signcolumn = true,         -- サインカラムを表示
        numhl = false,             -- 行番号のハイライトはオフ（スッキリさせるため）

        on_attach = function(bufnr)
          local gs = package.loaded.gitsigns

          local function map(mode, l, r, opts)
            opts = opts or {}
            opts.buffer = bufnr
            vim.keymap.set(mode, l, r, opts)
          end

          -- 1. 変更箇所を浮かせて確認 (Space + hp)
          map('n', '<leader>hp', gs.preview_hunk,
            { desc = "Preview Git Hunk" })

          -- 2. 次/前の変更箇所へジャンプ ( ]c / [c )
          map('n', ']c', function()
            if vim.wo.diff then return ']c' end
            vim.schedule(function()
              gs.next_hunk()
            end)
            return '<Ignore>'
          end, { expr = true, desc = "Next Git Hunk" })

          map('n', '[c', function()
            if vim.wo.diff then return '[c' end
            vim.schedule(function()
              gs.prev_hunk()
            end)
            return '<Ignore>'
          end, { expr = true, desc = "Prev Git Hunk" })

          -- 3. その行の変更を取り消す (Space + hr)
          map('n', '<leader>hr', gs.reset_hunk,
            { desc = "Reset Git Hunk" })

          -- 4. 変更をステージング (Space + hs)
          map('n', '<leader>hs', gs.stage_hunk,
            { desc = "Stage Git Hunk" })
        end
      })
    end
  }, {
  "rachartier/tiny-inline-diagnostic.nvim",
  event = "LspAttach",
  priority = 1000,
  config = function()
    require('tiny-inline-diagnostic').setup({
      -- オプション：エラーメッセージを常に表示するか、カーソル行だけにするかなど
      preset = "modern",                -- "modern", "classic", "minimal" などから選べます
      hi = {
        background = "NONE"             -- 背景を透明にすると Kitty の透明度と馴染みます
      }
    })
    -- 重要：標準機能をオフ
    vim.diagnostic.config({ virtual_text = false })
  end
}
}
