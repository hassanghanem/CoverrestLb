import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MaintenanceError: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="container container-padding mx-auto flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
            <Card className="max-w-xl w-full border border-border bg-muted/20 shadow-sm">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <Badge
                            variant="outline"
                            className="border-yellow-500/50 bg-yellow-50 text-yellow-700 flex items-center gap-2"
                        >
                            <Wrench className="h-4 w-4" />
                            {t('Maintenance Mode')}
                        </Badge>
                    </div>
                    <CardTitle className="text-3xl font-semibold text-foreground lg:text-4xl">
                        {t('We’re updating our systems')}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 text-muted-foreground">
                    <p className="text-base">
                        {t(
                            'We’re currently performing some scheduled maintenance. Please check back soon.'
                        )}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                            <a href="/">
                                <Home className="mr-2 h-4 w-4" />
                                {t('Back to homepage')}
                            </a>
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                            <a href="/support">
                                {t('Contact Support')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>

                    <p className="mt-6 text-xs text-muted-foreground">
                        {t('We appreciate your patience and understanding.')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default MaintenanceError;
