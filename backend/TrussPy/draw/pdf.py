from io import BytesIO
import time
from matplotlib import pyplot as plt
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer, Paragraph, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from .draw import plot_truss, plot_truss_structure
from ..data_types import Computational_Data, Visualization_Data

pdfmetrics.registerFont(
    TTFont('SourceHanSerif', './ttf/SourceHanSerifCN-VF.ttf'))
pdfmetrics.registerFont(TTFont('FangSong', './ttf/仿宋_GB2312.TTF'))

styles = getSampleStyleSheet()
style_centered = ParagraphStyle(
    name="Subtitle",
    fontName="FangSong",
    fontSize=12,
    alignment=TA_CENTER,  # 居中对齐
)

style_titel = ParagraphStyle(
    name="Title",
    fontName="SourceHanSerif",
    fontSize=16,
    alignment=TA_CENTER,  # 居中对齐
)

# 创建三线表样式的函数


def create_three_line_table(data, col_widths=None):
    table = Table(data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, 0), 1.0, colors.black),  # 顶部线较粗
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, colors.black),  # 表头下方线较细
        ('LINEBELOW', (0, -1), (-1, -1), 1.0, colors.black),  # 底部线较粗
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),  # 文本居中
        ('FONTNAME', (0, 0), (-1, 0), 'SourceHanSerif'),  # 表头使用支持中文的字体
        ('FONTNAME', (0, 1), (-1, -1), 'FangSong'),  # 表格其他部分使用仿宋字体
    ]))
    return table

# 格式化数据为表格


def format_data_as_three_line_table(viz_data: Visualization_Data, comp_data: Computational_Data):
    elements = []

    # 点数据表头
    elements.append(Paragraph('点数据', style_centered))
    elements.append(Spacer(1, 6))

    # 点数据三线表
    points_table_data = [['点编号', 'x 坐标', 'y 坐标', 'dx', 'dy', '约束类型', '旋转角度']]
    for i, point in enumerate(viz_data['points']):
        points_table_data.append([
            f'{i + 1}', f"{point['x']:.4e}", f"{point['y']:.4e}",
            f"{point['dx']:.4e}", f"{point['dy']:.4e}",
            f"{point['Constraint_Type']}", f"{point['theta']}"
        ])

    points_table = create_three_line_table(points_table_data)
    elements.append(points_table)
    elements.append(Spacer(1, 12))

    # 杆件数据表头
    elements.append(Paragraph('杆件数据', style_centered))
    elements.append(Spacer(1, 6))

    # 杆件数据三线表（包含计算中的 k、E、m）
    lines_table_data = [
        ['杆件编号', '连接点', '应力 σ', '轴力', 'k', 'E', 'm']]
    for i, line_force in enumerate(viz_data['lines']):
        comp_line = comp_data['lines'][i]  # 从计算数据中获取对应的杆件
        lines_table_data.append([
            f'{i + 1}', f"{line_force['points'][0]+1}, {line_force['points'][1]+1}", f"{line_force['sigma']:.4e}",
            f"{line_force['sigma']*comp_line['A']:.4e}", f"{comp_line['k']:.4e}", f"{comp_line['E']:.4e}", f"{comp_line['m']:.4e}",
        ])

    lines_table = create_three_line_table(lines_table_data)
    elements.append(lines_table)
    elements.append(Spacer(1, 12))

    # 载荷数据表头
    elements.append(Paragraph('载荷数据', style_centered))
    elements.append(Spacer(1, 6))

    # 载荷数据三线表
    loads_table_data = [['载荷编号', '作用点', 'Fx', 'Fy']]
    for i, load in enumerate(viz_data['loads']):
        loads_table_data.append([
            f'{i + 1}', f"{load['point']+1}", f"{load['Fx']:.4e}", f"{load['Fy']:.4e}"
        ])

    loads_table = create_three_line_table(loads_table_data)
    elements.append(loads_table)
    elements.append(Spacer(1, 12))

    return elements

# 生成 PDF 的函数


def generate_pdf_with_title_images_tables(viz_data: Visualization_Data, comp_data: Computational_Data, pdf_file, disp_scale: int = 100, load_scale: int = 100):
    doc = SimpleDocTemplate(pdf_file, pagesize=A4,
                            leftMargin=20*mm, rightMargin=20*mm,
                            topMargin=20*mm, bottomMargin=20*mm)

    elements = []

    # 添加标题
    elements.append(Paragraph('桁架结构计算结果输出', style_titel))
    elements.append(Spacer(1, 12))

    # 添加小标题
    elements.append(Paragraph(
        f'日期: {time.strftime("%Y-%m-%d", time.localtime())}', style_centered))
    elements.append(Spacer(1, 12))

    plot_truss(comp_data, load_scale=load_scale)
    img_buf1 = BytesIO()
    plt.savefig(img_buf1, format='png')
    plt.close()
    img_buf1.seek(0)
    plot_truss_structure(
        viz_data, disp_scale=disp_scale, load_scale=load_scale)
    img_buf2 = BytesIO()
    plt.savefig(img_buf2, format='png')
    plt.close()
    img_buf2.seek(0)
    images = [img_buf1, img_buf2]

    # 将 matplotlib 图像转换为字节流
    image1 = Image(images[0], width=96 * mm, height=72 * mm)  # 调整图片大小
    image2 = Image(images[1], width=96 * mm, height=72 * mm)
    image_table = Table([[image1, image2]], colWidths=[100 * mm, 100 * mm])
    image_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),  # 图片居中
    ]))
    elements.append(image_table)
    elements.append(Spacer(1, 12))

    # 格式化数据为表格
    elements += format_data_as_three_line_table(viz_data, comp_data)

    # 生成 PDF
    doc.build(elements)
