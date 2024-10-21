# TrussVizPy

> 项目使用图标来自阿里矢量图标库，侵权请联系，使用请注意

TrussVizPy 是一款基于 Python 和 React 的开源工具，用于平面桁架的静力分析。通过直观的拖拽操作，用户可以快速构建桁架模型，并自定义节点和杆件属性。内置的求解器可高效计算桁架内力和变形，并以图形方式展示结果。TrussVizPy 适用于结构工程教学、科研以及小型工程项目的初步设计。

## 快速开始

#### 1. 安装依赖包：

```bash
pip install -r ./backend/requirements.txt
npm install -g sass
npm install -g msgpack
```

#### 2. 启动服务：

后端
```bash
python ./backend/app.py
```
前端
```bash
cd ./react-frontend
npm start
```

后端默认使用328端口，测试环境可在`./react-frontend/src/page/Truss/draw/Right.js`中修改前端使用的服务器和端口号

## 生产环境部署

打包

```bash
cd ./react-frontend
npm run build
```

具体部署方式可自行选择


