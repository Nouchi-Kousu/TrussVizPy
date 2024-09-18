from typing import TypedDict


# 前端通过GET方法传递的桁架结构相关的输入数据
class FrontendInputData(TypedDict):
    ...

# 后端在计算前对前端数据进行预处理后的数据结构
class PreprocessedData(TypedDict):
    ...

# 后端进行桁架结构计算后生成的结果数据
class CalculationResultData(TypedDict):
    ...

# 后端将计算结果处理后返回给前端，用于可视化展示的结果数据
class VisualizationData(TypedDict):
    ...
