"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react";

export default function Home() {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const organization = useOrganization();
  const user = useUser();
  const time = new Date();
  const { toast } = useToast()

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const files = useQuery(api.file.getFiles, orgId ? { orgId } : "skip")
  const createFile = useMutation(api.file.createFile)
  const formSchema = z.object({
    title: z.string().min(1).max(200),
    // selFile: z.custom<File | null>((val) => val instanceof File, "Required"),
    selFile: z.custom<FileList>((val) => val instanceof FileList, "Required").refine((files) => files.length > 0, 'Required'),
  })
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      // selFile: null,
      selFile: undefined,
    },
  })
  const fileRef = form.register("selFile")
  const generateUploadUrl = useMutation(api.file.generateUploadUrl);
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values)
    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.selFile[0].type },
      body: values.selFile[0],
    });
    const { storageId } = await result.json();

    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
      })
      form.reset();
      setIsFileDialogOpen(false)
      toast({
        variant: "success",
        title: `File Uploaded! ${time}`,
        description: "Now everyone can view your file",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: `Something went wrong`,
        description: "Your file could not be uploaded, try again later!",
      })
    }
  }
  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="flex items-start">DJRATAN</h1>
        <Dialog
          open={isFileDialogOpen}
          onOpenChange={(isOpen) => {
            setIsFileDialogOpen(isOpen)
            form.reset()
          }}>
          <DialogTrigger><Button onClick={() => { }}>Upload</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle >Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Upload your file here!</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="file name" {...field} />
                          </FormControl>
                          <FormDescription>
                            the tile of your file                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="selFile"
                      render={() => (
                        <FormItem>
                          <FormLabel>Select File</FormLabel>
                          <FormControl>
                            <Input
                              {...fileRef}
                              type="file" placeholder="file name" />
                          </FormControl>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit"
                      disabled={form.formState.isSubmitting}
                      // disabled={true}
                      className="flex gap-1"
                      onClick={() => {
                        // toast({
                        //   variant: "success",
                        //   title: `File Uploaded! ${time}`,
                        //   description: "Now everyone can view your file",
                        // })
                      }}>

                      {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit
                    </Button>
                  </form>
                </Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        {files?.map((item) => {
          return <p key={item._id}>{item.name}</p>
        })}
      </div>
      <div>
      </div>
    </main>
  );
}

