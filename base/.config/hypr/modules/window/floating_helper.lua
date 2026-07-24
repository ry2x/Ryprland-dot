local M = {}

M.makeRuleWithDefaults = function(defaults, values)
    local merged = {}

    for key, value in pairs(defaults) do
        merged[key] = value
    end

    for key, value in pairs(values) do
        merged[key] = value
    end

    return merged
end

M.applyWindowRules = function(rules)
    for _, rule in ipairs(rules) do
        hl.window_rule({
            match = rule[1],
            tag = "+" .. rule[2]
        })
    end
end

return M
