#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为HTML页面添加keywords meta标签
"""
import os

pages_keywords = {
    'daily-report.html': '副业日报,运营日报,副业动态,平台活动,行业趋势,副业赚钱',
    'disclaimer.html': '免责声明,副业发现,网站声明,法律声明,版权声明',
    'favorites.html': '我的收藏,副业收藏,平台收藏,副业管理',
    'platform-detail.html': '平台详情,副业平台,平台评测,平台对比,收入情况,风险提示',
    'privacy.html': '隐私政策,个人信息,数据保护,隐私保护,用户协议',
    'scam-detail.html': '骗局详情,骗局曝光,防骗指南,骗局案例,诈骗手法,网络诈骗',
    'search.html': '搜索副业,副业搜索,平台搜索,副业查询'
}

def add_keywords(filepath, keywords):
    """为页面添加keywords meta标签"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已有keywords
    if 'name="keywords"' in content:
        print(f"{filepath}: 已有keywords")
        return False
    
    # 找到<title>标签后的位置插入keywords
    title_end = content.find('</title>')
    if title_end == -1:
        print(f"{filepath}: 未找到</title>标签")
        return False
    
    keywords_tag = f'\n  <meta name="keywords" content="{keywords}">'
    
    # 在</title>后插入
    new_content = content[:title_end + 8] + keywords_tag + content[title_end + 8:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"{filepath}: keywords添加成功")
    return True

def main():
    for page_name, keywords in pages_keywords.items():
        if os.path.exists(page_name):
            add_keywords(page_name, keywords)
        else:
            print(f"{page_name}: 文件不存在")

if __name__ == "__main__":
    main()
