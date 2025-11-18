import { Card, CardContent } from "./card";
import { LoadingState } from "./LoadingState";

export function FilterLoadingCard() {
  return (
    <Card>
      <CardContent className="py-8">
        <LoadingState message="Kraunami filtrai..." />
      </CardContent>
    </Card>
  );
}

