-- Add images from the same directory when opening a single file.
swayimg.imagelist.adjacent = true
swayimg.imagelist.order = "numeric"

-- Cycle through the image list at its boundaries.
swayimg.viewer.loop = true

-- Open the previous/next image with Shift + Left/Right.
swayimg.viewer.on_key("Shift+left", function()
    swayimg.viewer.open("prev")
end)

swayimg.viewer.on_key("Shift+right", function()
    swayimg.viewer.open("next")
end)

swayimg.viewer.on_key("Shift+h", function()
    swayimg.viewer.open("prev")
end)

swayimg.viewer.on_key("Shift+l", function()
    swayimg.viewer.open("next")
end)

-- Zoom in/out with Ctrl + Up/Down.
swayimg.viewer.on_key("Ctrl+up", function()
    swayimg.viewer.scale = swayimg.viewer.scale + swayimg.viewer.scale / 10
end)

swayimg.viewer.on_key("Ctrl+down", function()
    swayimg.viewer.scale = swayimg.viewer.scale - swayimg.viewer.scale / 10
end)

swayimg.viewer.on_key("Ctrl+k", function()
    swayimg.viewer.scale = swayimg.viewer.scale + swayimg.viewer.scale / 10
end)

swayimg.viewer.on_key("Ctrl+j", function()
    swayimg.viewer.scale = swayimg.viewer.scale - swayimg.viewer.scale / 10
end)

-- Show or hide image information with Tab.
swayimg.viewer.on_key("Tab", function()
    swayimg.text.visible = not swayimg.text.visible
end)
