import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle, ArrowRight } from 'lucide-react';

const NotFoundError: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="container container-padding mx-auto flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
            <Card className="max-w-xl w-full border border-border bg-muted/20 shadow-sm">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <Badge
                            variant="outline"
                            className="border-red-500/50 bg-red-50 text-red-700 flex items-center gap-2"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            {t('Error')}
                        </Badge>
                    </div>

                    <CardTitle className="text-3xl font-semibold text-foreground lg:text-4xl">
                        {t('Page Not Found')}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 text-muted-foreground">
                    <p className="text-base">
                        {t(
                            'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
                        )}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/')}>
                            <Home className="mr-2 h-4 w-4" />
                            {t('Back to homepage')}
                        </Button>
                        <Button className="w-full sm:w-auto" onClick={() => navigate('/support')}>
                            {t('Contact Support')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    <p className="mt-6 text-xs text-muted-foreground">
                        {t('If you believe this is a mistake, please let us know.')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotFoundError;
