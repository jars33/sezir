
import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/use-accounts";
import { AccountDialog } from "@/components/accounts/AccountDialog";
import { useTranslation } from "react-i18next";

export function AccountSwitcher() {
  const [open, setOpen] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const { accounts, currentAccount, switchAccount, loading } = useAccounts();
  const { t } = useTranslation();

  if (loading) {
    return (
      <Button variant="outline" className="justify-between w-full" disabled>
        <span className="truncate">Loading...</span>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between w-full">
            <span className="truncate">{currentAccount?.name || t('accounts.selectCompany')}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuGroup>
            {accounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                className={cn("cursor-pointer", { "bg-accent": account.is_current })}
                onSelect={() => {
                  if (!account.is_current) {
                    switchAccount(account.id);
                  }
                  setOpen(false);
                }}
              >
                <span className="truncate flex-1">{account.name}</span>
                {account.is_current && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setOpen(false);
              setShowAccountDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>{t('accounts.addCompany')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
      />
    </>
  );
}
