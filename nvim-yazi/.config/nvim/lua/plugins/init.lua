local modules = { "ui", "finder", "editing", "lsp", "formatting" }

local plugins = {}
for _, m in ipairs(modules) do
    vim.list_extend(plugins, require("plugins." .. m))
end

return plugins
