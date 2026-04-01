import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

export default function CookieConsent() {
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent")
        if (!consent) {
            setVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem("cookie_consent", "true")
        setVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem("cookie_consent", "false")
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-4 z-50 max-w-md">
            <Card className="shadow-lg border bg-white dark:bg-gray-950">
                <CardContent className="p-4">
                    <p className="text-sm mb-4">
                        {t("We use cookies to enhance your browsing experience. By accepting, you agree to our use of cookies.")}
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleDecline}>
                            {t("Decline")}
                        </Button>
                        <Button onClick={handleAccept}>
                            {t("Accept")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
