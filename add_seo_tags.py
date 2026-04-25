#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为HTML页面添加SEO标签
"""
import os
import re

def add_seo_tags(html_content, page_name, page_title, page_description):
    """为HTML内容添加SEO标签"""
    
    # Canonical URL
    canonical = f'<link rel="canonical" href="https://fuyep.top/{page_name}.html">\n'
    
    # Open Graph
    og_tags = f'''  <!-- Open Graph -->
  <meta property="og:title" content="{page_title}">
  <meta property="og:description" content="{page_description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://fuyep.top/{page_name}.html">
  <meta property="og:site_name" content="副业发现平台">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:image" content="https://fuyep.top/images/og-default.png">
'''
    
    # Twitter Card
    twitter_tags = f'''  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{page_title}">
  <meta name="twitter:description" content="{page_description}">
'''
    
    # JSON-LD
    json_ld = f'''  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "{page_title}",
    "description": "{page_description}",
    "url": "https://fuyep.top/{page_name}.html",
    "inLanguage": "zh-CN",
    "isPartOf": {{
      "@type": "WebSite",
      "name": "副业发现平台",
      "url": "https://fuyep.top"
    }},
    "about": {{
      "@type": "Thing",
      "name": "副业推荐"
    }}
  }}
  </script>
'''
    
    return canonical, og_tags, twitter_tags, json_ld

# 页面配置
pages_config = {
    'compare.html': {
        'title': '平台对比 - 副业发现平台',
        'description': '对比不同副业平台的特点、收入、风险和适合人群，帮助你选择最适合的副业赚钱方式。'
    },
    'daily-report.html': {
        'title': '每日副业报告 - 副业发现平台',
        'description': '每日更新副业赚钱最新动态、平台活动和行业趋势，助你把握副业赚钱机会。'
    },
    'disclaimer.html': {
        'title': '免责声明 - 副业发现平台',
        'description': '副业发现平台免责声明，网站内容仅供参考，不构成任何投资或合作建议。'
    },
    'favorites.html': {
        'title': '我的收藏 - 副业发现平台',
        'description': '收藏你感兴趣的副业项目和平台，方便随时查看和比较。'
    },
    'platform-detail.html': {
        'title': '平台详情 - 副业发现平台',
        'description': '查看平台详细信息、收入情况、风险提示和新手入门指南。'
    },
    'privacy.html': {
        'title': '隐私政策 - 副业发现平台',
        'description': '副业发现平台隐私政策，说明我们如何收集、使用和保护您的个人信息。'
    },
    'scam-detail.html': {
        'title': '骗局详情 - 副业发现平台',
        'description': '揭露各类副业骗局套路，了解骗子的常用手法，避免上当受骗。'
    },
    'search.html': {
        'title': '搜索副业 - 副业发现平台',
        'description': '搜索副业项目、平台和骗局案例，找到适合你的赚钱机会。'
    },
    'stats.html': {
        'title': '副业数据统计 - 副业发现平台',
        'description': '查看副业赚钱行业数据分析，包括平台分布、收入统计、骗局趋势等。'
    },
    'submit.html': {
        'title': '提交副业 - 副业发现平台',
        'description': '分享你的副业经历或推荐靠谱平台，帮助更多人找到合适的副业。'
    },
    'success-cases.html': {
        'title': '成功案例 - 副业发现平台',
        'description': '100个真实副业赚钱成功案例分享，学习别人的副业经验和技巧。'
    }
}

def process_file(filepath, page_name, config):
    """处理单个HTML文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已有canonical
    if 'rel="canonical"' in content:
        print(f"{page_name}: 已有canonical，跳过")
        return False
    
    canonical, og_tags, twitter_tags, json_ld = add_seo_tags(
        content, page_name, config['title'], config['description']
    )
    
    # 查找<head>标签位置，在</head>前添加
    head_end = content.find('</head>')
    if head_end == -1:
        print(f"{page_name}: 未找到</head>标签")
        return False
    
    # 在</head>前插入SEO标签
    new_content = content[:head_end] + canonical + og_tags + twitter_tags + json_ld + content[head_end:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"{page_name}: SEO标签添加成功")
    return True

def main():
    for page_name, config in pages_config.items():
        filepath = page_name
        if os.path.exists(filepath):
            process_file(filepath, page_name, config)
        else:
            print(f"{page_name}: 文件不存在")

if __name__ == "__main__":
    main()
