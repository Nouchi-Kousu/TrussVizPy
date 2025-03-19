# TrussVizPy

[![DOI](https://zenodo.org/badge/857568498.svg)](https://doi.org/10.5281/zenodo.13968273)

TrussVizPy 是一款基于 Python 和 React 的开源工具，用于平面桁架的静力分析。通过直观的拖拽操作，用户可以快速构建桁架模型，并自定义节点和杆件属性。内置的求解器可高效计算桁架内力和变形，并以图形方式展示结果。TrussVizPy 适用于结构工程教学、科研以及小型工程项目的初步设计。

## 快速开始

#### 1. 安装依赖包：

Python版本3.11，使用[uv](https://github.com/astral-sh/uv)管理Python环境

```bash
cd ./react-frontend
uv sync
```

Node版本22.13，使用yarn管理依赖

```bash
cd ./react-frontend
yarn install
```

#### 2. 启动服务：

后端
```bash
cd ./react-frontend
uv run app.py
```
前端
```bash
cd ./react-frontend
yarn start
```

后端默认使用1224端口，测试环境可在`./react-frontend/src/page/Truss/draw/Right.js`中修改前端使用的服务器和端口号

## 生产环境部署

打包

```bash
cd ./react-frontend
npm run build
```

或从 [Releases](https://github.com/Nouchi-Kousu/TrussVizPy/releases) 下载已构建好的压缩包进行部署。

具体部署方式可自行选择

## 使用

访问`IP/truss`，左侧为桁架结构绘制区，在绘制之前，应先与杆件处点击顶部图标定义材料（已有默认材料），在右侧展示区可实时显示绘制的结构，加载后，在右侧会实时显示桁架内力计算结果，若不加载仅计算自重载荷，可点击左侧强制提交计算按键，强制发送计算。右侧展示区可使用选择菜单查看结点位移和杆件内力。两侧均可点击保存按键将图形保存为png图片。

另可分别访问`IP/truss/draw`和`IP/truss/show`分别访问绘制区和展示区
