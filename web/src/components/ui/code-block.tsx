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
        'relative rounded-lg border border-zinc-700 overflow-x-auto',
        className,
      )}
      {...props}
    >
      <div
        className="[&_pre]:p-4 [&_pre]:text-sm [&_pre]:font-mono [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: parsedCode }}
      />
    </div>
  )
}

export default CodeBlock
