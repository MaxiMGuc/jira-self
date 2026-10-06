import './Alert.css'

type AlertProps = {
  children: string
  testId?: string
}

export function Alert({ children, testId }: AlertProps) {
  return (
    <p className="ui-alert" role="alert" data-testid={testId}>
      {children}
    </p>
  )
}
