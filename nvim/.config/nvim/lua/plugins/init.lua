local modules = {
  "ui",
  "explorer",
  "finder",
  "editing",
  "lsp",
  "misc",
}

local plugins = {}
for _, m in ipairs(modules) do
  local ok, p = pcall(require, "plugins." .. m)
  if ok and type(p) == "table" then
    for _, v in ipairs(p) do
      table.insert(plugins, v)
    end
  end
end

return plugins
