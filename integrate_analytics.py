#!/usr/bin/env python3
"""
自动将统计代码集成到所有HTML页面
使用方法: python integrate_analytics.py
"""

import os
import re

# 统计代码 - 放在 </body> 前
ANALYTICS_SCRIPT = '''  <!-- 数据统计 -->
  <script src="js/analytics.js"></script>
</body>'''

# 需要排除的文件（如果有）
EXCLUDE_FILES = ['stats.html', 'daily-report.html']

def get_html_files(directory):
    """获取所有HTML文件"""
    html_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    return html_files

def integrate_analytics(file_path):
    """将统计代码集成到单个HTML文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已经集成
    if 'analytics.js' in content:
        return False, '已存在统计代码'
    
    # 检查是否是完整的HTML文件
    if '</body>' not in content:
        return False, '不是完整的HTML文件或缺少</body>'
    
    # 替换 </body> 标签，添加统计代码
    new_content = content.replace('</body>', ANALYTICS_SCRIPT)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True, '集成成功'

def main():
    # 脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print('=' * 50)
    print('副业发现平台 - 统计代码集成工具')
    print('=' * 50)
    print()
    
    # 获取所有HTML文件
    html_files = get_html_files(script_dir)
    
    # 过滤排除的文件
    html_files = [f for f in html_files if os.path.basename(f) not in EXCLUDE_FILES]
    
    print(f'找到 {len(html_files)} 个HTML文件')
    print()
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for file_path in sorted(html_files):
        filename = os.path.basename(file_path)
        success, message = integrate_analytics(file_path)
        
        if success:
            print(f'✅ {filename}: {message}')
            success_count += 1
        else:
            if '已存在' in message:
                print(f'⏭️  {filename}: {message}')
                skip_count += 1
            else:
                print(f'❌ {filename}: {message}')
                error_count += 1
    
    print()
    print('=' * 50)
    print(f'完成！成功: {success_count}, 跳过: {skip_count}, 失败: {error_count}')
    print('=' * 50)
    print()
    print('⚠️  请记得配置 js/analytics.js 中的统计代码：')
    print('   1. 访问 https://tongji.baidu.com 或 https://www.51.la')
    print('   2. 注册并添加你的网站')
    print('   3. 打开 js/analytics.js，将 enabled 改为 true')
    print('   4. 填入对应的 src 地址')

if __name__ == '__main__':
    main()
