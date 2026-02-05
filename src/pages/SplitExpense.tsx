 import { useState } from "react";
 import { Card } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { DollarSign, Users, Plus, Trash2, Receipt, Upload, Check, Clock, ChevronRight, Image } from "lucide-react";
import { Divide } from "lucide-react";
 import { IOSHeader } from "@/components/IOSHeader";
 import { IOSTabBar } from "@/components/IOSTabBar";
 import { toast } from "sonner";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { Skeleton } from "@/components/ui/skeleton";
 import { format } from "date-fns";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog";
 
 interface Participant {
   name: string;
   amount: string;
 }
 
 interface SplitExpense {
   id: string;
   title: string;
   description: string | null;
   total_amount: number;
   category: string;
   receipt_url: string | null;
   status: string;
   created_at: string;
   participants?: {
     id: string;
     participant_name: string;
     amount: number;
     is_paid: boolean;
   }[];
 }
 
 const SplitExpense = () => {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const [isCreating, setIsCreating] = useState(false);
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [participants, setParticipants] = useState<Participant[]>([
     { name: "", amount: "" },
     { name: "", amount: "" },
   ]);
   const [receiptFile, setReceiptFile] = useState<File | null>(null);
   const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
   const [uploading, setUploading] = useState(false);
   const [selectedSplit, setSelectedSplit] = useState<SplitExpense | null>(null);
   const [deletingSplitId, setDeletingSplitId] = useState<string | null>(null);
  const [splitTotal, setSplitTotal] = useState("");
 
   // Fetch split expenses
   const { data: splitExpenses, isLoading } = useQuery({
     queryKey: ["split-expenses", user?.id],
     queryFn: async () => {
       if (!user?.id) return [];
       const { data, error } = await supabase
         .from("split_expenses")
         .select(`
           *,
           participants:split_participants(*)
         `)
         .eq("user_id", user.id)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       return data as SplitExpense[];
     },
     enabled: !!user?.id,
   });
 
   // Create split expense mutation
   const createSplitMutation = useMutation({
     mutationFn: async (data: {
       title: string;
       description: string;
       participants: Participant[];
       receiptUrl: string | null;
     }) => {
       if (!user?.id) throw new Error("User not authenticated");
 
       const totalAmount = data.participants.reduce(
         (sum, p) => sum + (parseFloat(p.amount) || 0),
         0
       );
 
       // Create split expense
       const { data: splitData, error: splitError } = await supabase
         .from("split_expenses")
         .insert([
           {
             user_id: user.id,
             title: data.title,
             description: data.description || null,
             total_amount: totalAmount,
             receipt_url: data.receiptUrl,
           },
         ])
         .select()
         .single();
 
       if (splitError) throw splitError;
 
       // Add participants
       const participantsData = data.participants
         .filter((p) => p.name && p.amount)
         .map((p) => ({
           split_expense_id: splitData.id,
           participant_name: p.name,
           amount: parseFloat(p.amount),
         }));
 
       if (participantsData.length > 0) {
         const { error: participantsError } = await supabase
           .from("split_participants")
           .insert(participantsData);
 
         if (participantsError) throw participantsError;
       }
 
       return splitData;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["split-expenses", user?.id] });
       toast.success("Split expense created!");
       resetForm();
     },
     onError: (error) => {
       toast.error("Failed to create split expense", {
         description: error.message,
       });
     },
   });
 
   // Update participant paid status
   const updatePaidMutation = useMutation({
     mutationFn: async ({ participantId, isPaid }: { participantId: string; isPaid: boolean }) => {
       const { error } = await supabase
         .from("split_participants")
         .update({ is_paid: isPaid })
         .eq("id", participantId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["split-expenses", user?.id] });
     },
   });
 
   // Delete split expense
   const deleteSplitMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from("split_expenses")
         .delete()
         .eq("id", id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["split-expenses", user?.id] });
       toast.success("Split expense deleted");
       setDeletingSplitId(null);
       setSelectedSplit(null);
     },
   });
 
   const resetForm = () => {
     setIsCreating(false);
     setTitle("");
     setDescription("");
     setParticipants([{ name: "", amount: "" }, { name: "", amount: "" }]);
     setReceiptFile(null);
     setReceiptPreview(null);
   };
 
   const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       setReceiptFile(file);
       const reader = new FileReader();
       reader.onloadend = () => {
         setReceiptPreview(reader.result as string);
       };
       reader.readAsDataURL(file);
     }
   };
 
   const uploadReceipt = async (): Promise<string | null> => {
     if (!receiptFile || !user?.id) return null;
 
     setUploading(true);
     try {
       const fileExt = receiptFile.name.split(".").pop();
       const fileName = `${user.id}/${Date.now()}.${fileExt}`;
 
       const { error: uploadError } = await supabase.storage
         .from("receipts")
         .upload(fileName, receiptFile);
 
       if (uploadError) throw uploadError;
 
       const { data: { publicUrl } } = supabase.storage
         .from("receipts")
         .getPublicUrl(fileName);
 
       return publicUrl;
     } catch (error) {
       console.error("Upload error:", error);
       return null;
     } finally {
       setUploading(false);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (!title.trim()) {
       toast.error("Please enter a title");
       return;
     }
 
     const validParticipants = participants.filter((p) => p.name && p.amount);
     if (validParticipants.length < 2) {
       toast.error("Add at least 2 participants with amounts");
       return;
     }
 
     const receiptUrl = await uploadReceipt();
 
     createSplitMutation.mutate({
       title,
       description,
       participants: validParticipants,
       receiptUrl,
     });
   };
 
   const addParticipant = () => {
     setParticipants([...participants, { name: "", amount: "" }]);
   };
 
   const removeParticipant = (index: number) => {
     if (participants.length > 2) {
       setParticipants(participants.filter((_, i) => i !== index));
     }
   };
 
   const updateParticipant = (index: number, field: keyof Participant, value: string) => {
     const updated = [...participants];
     updated[index][field] = value;
     setParticipants(updated);
   };
 
  const splitEvenly = () => {
    const total = parseFloat(splitTotal);
    if (!total || total <= 0) {
      toast.error("Enter a total amount to split");
      return;
    }
    const participantsWithNames = participants.filter((p) => p.name.trim());
    if (participantsWithNames.length < 2) {
      toast.error("Add at least 2 participant names first");
      return;
    }
    const perPerson = (total / participantsWithNames.length).toFixed(2);
    const updated = participants.map((p) => ({
      ...p,
      amount: p.name.trim() ? perPerson : "",
    }));
    setParticipants(updated);
    toast.success(`Split $${total.toFixed(2)} evenly ($${perPerson} each)`);
  };

   const totalAmount = participants.reduce(
     (sum, p) => sum + (parseFloat(p.amount) || 0),
     0
   );
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "completed":
         return "text-success bg-success/10";
       case "pending":
         return "text-warning bg-warning/10";
       default:
         return "text-muted-foreground bg-muted";
     }
   };
 
   return (
     <div className="min-h-screen bg-background pb-24 safe-area-inset">
       <IOSHeader title="Split Expense" largeTitle showBack backPath="/expenses" />
 
       <div className="max-w-lg mx-auto px-4 pt-4">
         {!isCreating ? (
           <>
             <Button
               onClick={() => setIsCreating(true)}
               className="w-full h-12 mb-6"
             >
               <Users className="w-5 h-5 mr-2" />
               Create New Split
             </Button>
 
             {/* Split Expenses List */}
             <h2 className="text-lg font-bold mb-3">Your Splits</h2>
 
             {isLoading ? (
               <Card className="p-4 bg-gradient-card border-0">
                 <Skeleton className="h-16 mb-2" />
                 <Skeleton className="h-16" />
               </Card>
             ) : splitExpenses && splitExpenses.length > 0 ? (
               <div className="space-y-3">
                 {splitExpenses.map((split) => {
                   const paidCount = split.participants?.filter((p) => p.is_paid).length || 0;
                   const totalParticipants = split.participants?.length || 0;
                   const allPaid = paidCount === totalParticipants && totalParticipants > 0;
 
                   return (
                     <Card
                       key={split.id}
                       className="p-4 bg-gradient-card border-0 cursor-pointer hover:shadow-md transition-shadow"
                       onClick={() => setSelectedSplit(split)}
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="bg-primary/10 p-2 rounded-xl">
                             <Users className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                             <p className="font-semibold">{split.title}</p>
                             <p className="text-xs text-muted-foreground">
                               {totalParticipants} people • {format(new Date(split.created_at), "MMM d")}
                             </p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="text-right">
                             <p className="font-bold">${Number(split.total_amount).toFixed(2)}</p>
                             <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(allPaid ? "completed" : "pending")}`}>
                               {paidCount}/{totalParticipants} paid
                             </span>
                           </div>
                           <ChevronRight className="w-4 h-4 text-muted-foreground" />
                         </div>
                       </div>
                     </Card>
                   );
                 })}
               </div>
             ) : (
               <Card className="p-8 text-center bg-gradient-card border-0">
                 <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                 <p className="text-muted-foreground">No split expenses yet</p>
                 <p className="text-sm text-muted-foreground mt-1">
                   Create one to track shared purchases
                 </p>
               </Card>
             )}
           </>
         ) : (
           <form onSubmit={handleSubmit} className="space-y-6">
             <Card className="p-6 bg-gradient-card border-0 shadow-md">
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="title" className="text-base font-semibold">
                     What are you splitting?
                   </Label>
                   <Input
                     id="title"
                     placeholder="e.g., Pizza night, Movie tickets..."
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="mt-2"
                   />
                 </div>
 
                 <div>
                   <Label htmlFor="description" className="text-base font-semibold">
                     Description (optional)
                   </Label>
                   <Textarea
                     id="description"
                     placeholder="Add any notes..."
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     className="mt-2 resize-none"
                     rows={2}
                   />
                 </div>
               </div>
             </Card>
 
             {/* Participants */}
             <Card className="p-6 bg-gradient-card border-0 shadow-md">
               <div className="flex items-center justify-between mb-4">
                 <Label className="text-base font-semibold">Who's splitting?</Label>
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   onClick={addParticipant}
                 >
                   <Plus className="w-4 h-4 mr-1" />
                   Add Person
                 </Button>
               </div>
 
              {/* Even Split Section */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Quick Split</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Total amount"
                      value={splitTotal}
                      onChange={(e) => setSplitTotal(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={splitEvenly}
                    className="shrink-0"
                  >
                    <Divide className="w-4 h-4 mr-1" />
                    Split Evenly
                  </Button>
                </div>
              </div>

               <div className="space-y-3">
                 {participants.map((participant, index) => (
                   <div key={index} className="flex gap-2 items-center">
                     <Input
                       placeholder="Name"
                       value={participant.name}
                       onChange={(e) => updateParticipant(index, "name", e.target.value)}
                       className="flex-1"
                     />
                     <div className="relative w-24">
                       <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                       <Input
                         type="number"
                         step="0.01"
                         placeholder="0.00"
                         value={participant.amount}
                         onChange={(e) => updateParticipant(index, "amount", e.target.value)}
                         className="pl-7"
                       />
                     </div>
                     {participants.length > 2 && (
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         onClick={() => removeParticipant(index)}
                         className="shrink-0"
                       >
                         <Trash2 className="w-4 h-4 text-destructive" />
                       </Button>
                     )}
                   </div>
                 ))}
               </div>
 
               <div className="mt-4 pt-4 border-t flex justify-between items-center">
                 <span className="font-semibold">Total</span>
                 <span className="text-xl font-bold text-primary">
                   ${totalAmount.toFixed(2)}
                 </span>
               </div>
             </Card>
 
             {/* Receipt Upload */}
             <Card className="p-6 bg-gradient-card border-0 shadow-md">
               <Label className="text-base font-semibold">Receipt (optional)</Label>
               <div className="mt-3">
                 {receiptPreview ? (
                   <div className="relative">
                     <img
                       src={receiptPreview}
                       alt="Receipt preview"
                       className="w-full h-40 object-cover rounded-lg"
                     />
                     <Button
                       type="button"
                       variant="destructive"
                       size="icon"
                       className="absolute top-2 right-2"
                       onClick={() => {
                         setReceiptFile(null);
                         setReceiptPreview(null);
                       }}
                     >
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
                 ) : (
                   <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                     <Image className="w-8 h-8 text-muted-foreground mb-2" />
                     <span className="text-sm text-muted-foreground">
                       Tap to upload receipt
                     </span>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleReceiptChange}
                       className="hidden"
                     />
                   </label>
                 )}
               </div>
             </Card>
 
             <div className="flex gap-3">
               <Button
                 type="button"
                 variant="outline"
                 className="flex-1 h-12"
                 onClick={resetForm}
               >
                 Cancel
               </Button>
               <Button
                 type="submit"
                 className="flex-1 h-12"
                 disabled={createSplitMutation.isPending || uploading}
               >
                 {uploading ? "Uploading..." : createSplitMutation.isPending ? "Creating..." : "Create Split"}
               </Button>
             </div>
           </form>
         )}
       </div>
 
       {/* Split Details Dialog */}
       <Dialog open={!!selectedSplit} onOpenChange={(open) => !open && setSelectedSplit(null)}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>{selectedSplit?.title}</DialogTitle>
             <DialogDescription>
               {selectedSplit?.description || "Track who has paid their share"}
             </DialogDescription>
           </DialogHeader>
 
           {selectedSplit && (
             <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                 <span className="font-medium">Total Amount</span>
                 <span className="text-xl font-bold">
                   ${Number(selectedSplit.total_amount).toFixed(2)}
                 </span>
               </div>
 
               {selectedSplit.receipt_url && (
                 <div>
                   <p className="text-sm font-medium mb-2">Receipt</p>
                   <img
                     src={selectedSplit.receipt_url}
                     alt="Receipt"
                     className="w-full h-40 object-cover rounded-lg"
                   />
                 </div>
               )}
 
               <div>
                 <p className="text-sm font-medium mb-2">Participants</p>
                 <div className="space-y-2">
                   {selectedSplit.participants?.map((participant) => (
                     <div
                       key={participant.id}
                       className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                     >
                       <div className="flex items-center gap-3">
                         <button
                           onClick={() =>
                             updatePaidMutation.mutate({
                               participantId: participant.id,
                               isPaid: !participant.is_paid,
                             })
                           }
                           className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                             participant.is_paid
                               ? "bg-success border-success text-success-foreground"
                               : "border-muted-foreground hover:border-success"
                           }`}
                         >
                           {participant.is_paid && <Check className="w-4 h-4" />}
                         </button>
                         <span className={participant.is_paid ? "line-through text-muted-foreground" : ""}>
                           {participant.participant_name}
                         </span>
                       </div>
                       <span className="font-semibold">
                         ${Number(participant.amount).toFixed(2)}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}
 
           <DialogFooter>
             <Button
               variant="destructive"
               onClick={() => setDeletingSplitId(selectedSplit?.id || null)}
             >
               <Trash2 className="w-4 h-4 mr-2" />
               Delete Split
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Delete Confirmation */}
       <AlertDialog open={!!deletingSplitId} onOpenChange={(open) => !open && setDeletingSplitId(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Delete split expense?</AlertDialogTitle>
             <AlertDialogDescription>
               This will permanently delete this split and all participant data.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction
               onClick={() => deletingSplitId && deleteSplitMutation.mutate(deletingSplitId)}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
 
       <IOSTabBar />
     </div>
   );
 };
 
 export default SplitExpense;