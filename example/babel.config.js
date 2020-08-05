module.exports = {
  plugins: [
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true
      }
    ],
    [
      "@babel/plugin-proposal-class-properties",
      {
        loose: true
      }
    ],
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-syntax-dynamic-import",
    [
      "import",
      {
        libraryName: "antd",
        style: true
      },
      "antd"
    ],
    [
      "import",
      {
        libraryName: "@/components",
        libraryDirectory: ""
      },
      "component"
    ]
  ],
  presets: [
    [
      "@babel/env",
      {
        modules: false,
        useBuiltIns: "usage",
        corejs: 3
      }
    ],
    "@babel/preset-typescript",
    "@babel/react"
  ]
}
