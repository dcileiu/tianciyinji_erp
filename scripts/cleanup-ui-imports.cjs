#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// UI组件列表 - 需要移除的导入
const uiComponents = [
  'Button',
  'Input',
  'Label',
  'Card',
  'CardContent',
  'CardHeader',
  'CardTitle',
  'CardDescription',
  'CardFooter',
  'Table',
  'TableBody',
  'TableCell',
  'TableHead',
  'TableHeader',
  'TableRow',
  'Dialog',
  'DialogContent',
  'DialogHeader',
  'DialogTitle',
  'DialogFooter',
  'DialogDescription',
  'Badge',
  'Select',
  'SelectContent',
  'SelectItem',
  'SelectTrigger',
  'SelectValue',
  'Textarea',
  'Checkbox',
  'Switch',
  'Alert',
  'AlertDescription',
  'AlertTitle',
  'Separator',
  'Skeleton',
  'Progress',
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
  'RadioGroup',
  'RadioGroupItem',
  'Avatar',
  'AvatarFallback',
  'AvatarImage',
  'Tooltip',
  'TooltipContent',
  'TooltipProvider',
  'TooltipTrigger',
  'DropdownMenu',
  'DropdownMenuContent',
  'DropdownMenuItem',
  'DropdownMenuLabel',
  'DropdownMenuSeparator',
  'DropdownMenuTrigger',
  'Popover',
  'PopoverContent',
  'PopoverTrigger',
  'Calendar',
  'Slider',
  'Form',
  'FormControl',
  'FormDescription',
  'FormField',
  'FormItem',
  'FormLabel',
  'FormMessage',
  'Sheet',
  'SheetContent',
  'SheetDescription',
  'SheetHeader',
  'SheetTitle',
  'SheetTrigger',
  'Command',
  'CommandDialog',
  'CommandEmpty',
  'CommandGroup',
  'CommandInput',
  'CommandItem',
  'CommandList',
  'CommandSeparator',
  'CommandShortcut',
  'Breadcrumb',
  'BreadcrumbEllipsis',
  'BreadcrumbItem',
  'BreadcrumbLink',
  'BreadcrumbList',
  'BreadcrumbPage',
  'BreadcrumbSeparator',
  'Pagination',
  'PaginationContent',
  'PaginationEllipsis',
  'PaginationFirst',
  'PaginationItem',
  'PaginationLast',
  'PaginationNext',
  'PaginationPrevious',
  'Accordion',
  'AccordionContent',
  'AccordionItem',
  'AccordionTrigger',
  'Collapsible',
  'CollapsibleContent',
  'CollapsibleTrigger',
]

// 创建正则表达式来匹配UI组件导入
const createImportRegex = components => {
  // 匹配从 @/components/ui 或 ~/components/ui 导入的语句
  const patterns = [
    // 单行导入: import { Button } from '@/components/ui/button'
    /import\s*\{\s*[^}]*\}\s*from\s*['"][@~]\/components\/ui\/[^'"]*['"]/g,
    // 多行导入
    /import\s*\{\s*[\s\S]*?\}\s*from\s*['"][@~]\/components\/ui\/[^'"]*['"]/g,
  ]
  return patterns
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content
    let hasChanges = false

    // 检查是否有UI组件导入
    const importRegexes = createImportRegex(uiComponents)

    for (const regex of importRegexes) {
      const matches = content.match(regex)
      if (matches) {
        console.log(`处理文件: ${filePath}`)
        for (const match of matches) {
          console.log(`  移除导入: ${match.trim()}`)
          newContent = newContent.replace(match, '')
          hasChanges = true
        }
      }
    }

    // 清理多余的空行
    if (hasChanges) {
      // 在import区域添加注释
      const scriptTagMatch = newContent.match(/<script[^>]*setup[^>]*>/i)
      if (scriptTagMatch) {
        const scriptStart = newContent.indexOf(scriptTagMatch[0]) + scriptTagMatch[0].length
        const importMatch = newContent.slice(scriptStart).match(/\nimport/)

        if (importMatch && !newContent.includes('// UI组件现在自动导入')) {
          const insertPosition = scriptStart + importMatch.index
          newContent =
            newContent.slice(0, insertPosition) +
            '\n// UI组件现在自动导入，无需手动导入\n' +
            newContent.slice(insertPosition)
        }
      }

      // 清理连续的空行
      newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n')

      fs.writeFileSync(filePath, newContent, 'utf8')
      console.log(`✅ 已更新: ${filePath}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message)
    return false
  }
}

// 主函数
function main() {
  console.log('🧹 开始清理UI组件导入语句...\n')

  // 查找所有Vue文件
  const patterns = ['app/pages/**/*.vue', 'app/components/**/*.vue', 'app/layouts/**/*.vue']

  let totalFiles = 0
  let processedFiles = 0

  for (const pattern of patterns) {
    const files = glob.sync(pattern)
    for (const file of files) {
      // 跳过UI组件目录本身
      if (file.includes('/components/ui/')) {
        continue
      }

      totalFiles++
      if (processFile(file)) {
        processedFiles++
      }
    }
  }

  console.log(`\n📊 处理完成:`)
  console.log(`   总文件数: ${totalFiles}`)
  console.log(`   已更新文件: ${processedFiles}`)
  console.log(`   跳过文件: ${totalFiles - processedFiles}`)

  if (processedFiles > 0) {
    console.log('\n✨ UI组件导入清理完成！现在所有UI组件都会自动导入。')
    console.log('💡 建议运行 `pnpm format` 来格式化代码。')
  } else {
    console.log('\n💫 没有找到需要清理的导入语句。')
  }
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = { processFile, uiComponents }
