import { Button } from '@aibees/ui';
import * as Styled from './styles';
import type { HomePageProps as Props } from './types';

export function HomePage({ className }: Props) {
  return (
    <Styled.Wrapper className={className}>
      <h1>HomePage</h1>
      <Button />
    </Styled.Wrapper>
  );
}
