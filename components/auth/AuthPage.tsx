import { Suspense } from "react";

import { AuthForm } from "@/components/auth/AuthForm";
import { Blocks } from "@/components/site/Blocks";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";

/**
 * Страницы /login и /register: заголовок, вводка и форма в серой
 * панели по центру. Форма читает ?next= — в статическом экспорте
 * это возможно только внутри Suspense.
 */
export function AuthPage({ mode }: { mode: "login" | "register" }) {
  return (
    <SitePage>
      <Blocks>
        <div className="page-shell flex justify-center pt-[30px] xl:pt-[60px]">
          <div className="rounded-panel xl:rounded-panel-d bg-surface w-full max-w-[520px] p-[8px] xl:p-[10px]">
            <div className="bg-canvas rounded-card xl:rounded-card-d shadow-card flex flex-col gap-[24px] p-[24px] xl:p-[40px]">
              <div className="flex flex-col gap-[10px]">
                <h1 className="font-display text-h1 xl:text-h2-d font-medium tracking-tight">
                  {t(mode === "login" ? "page.login.title" : "page.register.title")}
                </h1>
                <p className="font-ui text-card xl:text-card-d text-body leading-[1.5]">
                  {t(mode === "login" ? "page.login.lead" : "page.register.lead")}
                </p>
              </div>
              <Suspense fallback={null}>
                <AuthForm mode={mode} />
              </Suspense>
            </div>
          </div>
        </div>
      </Blocks>
    </SitePage>
  );
}
