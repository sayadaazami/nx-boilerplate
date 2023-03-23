import * as Styled from './styles';
import type { ButtonProps as Props } from './types.d';

export function Button({ className }: Props) {
  return (
    <Styled.Wrapper className={className}>
      <b>Button</b>
    </Styled.Wrapper>
  );
}
