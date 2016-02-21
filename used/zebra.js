// 加载图片
"pictures": {
    "zebra": { ".loadImage": "zebra.png" }
}

// 获取图片某部分
{ "$Picture": ["@pictures.zebra", 49, 0, 11, 18] }
