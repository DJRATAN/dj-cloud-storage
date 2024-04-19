
import { SignedIn, SignInButton, SignOutButton, SignedOut, UserButton, SignUpButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const Header = () => {
    return (
        <div className=" border-b py-4 bg-gray-50">
            <div className="flex justify-between items-center mx-auto container">
                <div>dj-drive</div>
                <div className="flex gap-2">
                    <UserButton />
                    <OrganizationSwitcher />
                    <div>
                        <SignedIn>
                            <SignOutButton><Button>Sign-out</Button></SignOutButton>
                        </SignedIn>
                    </div>
                    <SignedOut >
                        <div className="">
                            <SignInButton mode="modal">
                                <Button>SignIn</Button>
                            </SignInButton>
                        </div>
                        <div className="ml-2">
                            <SignUpButton>
                                <Button>Register</Button>
                            </SignUpButton>
                        </div>
                    </SignedOut>
                </div>
            </div>
        </div>
    )
}