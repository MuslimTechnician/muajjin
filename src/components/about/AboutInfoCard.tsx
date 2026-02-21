import { Card, CardContent } from '@/components/ui/card';

interface AboutInfoCardProps {
  title: string;
  description: string;
}

export function AboutInfoCard({ title, description }: AboutInfoCardProps) {
  return (
    <Card className="border bg-muted/30 shadow-sm">
      <CardContent className="p-4">
        <h3 className="mb-2 text-sm font-medium">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
