return {
  {
    "nvim-tree/nvim-tree.lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require("nvim-tree").setup({
        renderer = {
          highlight_git = true,
          icons = {
            show = { git = true, folder = true, file = true },
            glyphs = {
              default = "󰈚",
              symlink = "",
              folder = {
                arrow_closed = "󰅂",
                arrow_open = "󰅀",
                default = "",
                open = "",
                empty = "",
                empty_open = "",
                symlink = ""
              },
              git = {
                unstaged = "",
                staged = "✓",
                unmerged = "",
                renamed = "",
                untracked = "",
                deleted = "",
                ignored = "󰢤"
              }
            }
          }
        },
        view = { width = 30, side = "left" },
        filters = { dotfiles = false }
      })
    end
  },   -- 画像表示プラグイン (image.nvim)
  {
    "3rd/image.nvim",
    build = false,
    config = function()
      require("image").setup({
        backend = "kitty",         -- Kittyプロトコルを使用
        integrations = {
          markdown = {
            enabled = true,
            clear_in_insert_mode = false,
            download_remote_images = true,
            only_render_image_at_cursor = false
          },
          neorg = { enabled = true }
        },
        max_width = 100,
        max_height = 12,
        max_width_window_percentage = math.huge,
        max_height_window_percentage = math.huge,
        window_overlap_clear_enabled = false,
        pipe_path = "/tmp/neovim-runtime-magick-img"         -- パイプのパス
      })
    end
  }
}
