/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: well, it happens */
import { type ComponentProps, useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'
import { twMerge } from 'tailwind-merge'

interface CodeBlockProps extends ComponentProps<'div'> {
  code: string
  language?: string
}

const CodeBlock = ({
  className,
  code,
  language = 'json',
  ...props
}: CodeBlockProps) => {
  const [parsedCode, setParsedCode] = useState('')

  useEffect(() => {
    if (code) {
      codeToHtml(code, { lang: language, theme: 'catppuccin-mocha' }).then(
        (parsed) => setParsedCode(parsed),
      )
    }
  }, [code, language])

  return (
    <div
      className={twMerge(
        'relative rounded-lg border border-zinc-700 overflow-x-auto w-auto',
        className,
      )}
      {...props}
    >
      <div
        className="[&_pre]:p-4 [&_pre]:text-sm [&_pre]:font-mono [&_pre]:leading-relaxed [&_pre]:w-full [&_pre]:overflow-auto [&_pre]:scrollbar-thin [&_pre]:scrollbar-thumb-rounded-full [&_pre]:scrollbar-track-rounded-full [&_pre]:scrollbar-thumb-zinc-700 [&_pre]:scrollbar-track-zinc-900"
        dangerouslySetInnerHTML={{ __html: parsedCode }}
      />
    </div>
  )
}

export default CodeBlock
