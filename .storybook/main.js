module.exports = {
    stories: [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)"
    ],

    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/preset-create-react-app",
        "@chromatic-com/storybook"
    ],

    docs: {},

    framework: {
        name: "@storybook/react-webpack5",
        options: {}
    },

    typescript: {
        reactDocgen: "react-docgen-typescript"
    }
};
