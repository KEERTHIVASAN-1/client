import { motion } from "framer-motion";
import { Building2, Users, DoorOpen, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Block } from "@shared/schema";

interface BlockCardProps {
  block: Block;
  studentCount: number;
  roomCount: number;
  wardenName: string;
  wardenMobile: string;
  onClick?: () => void;
}

const blockColors: Record<Block, string> = {
  A: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  B: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  C: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  D: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function BlockCard({
  block,
  studentCount,
  roomCount,
  wardenName,
  wardenMobile,
  onClick,
}: BlockCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="hover-elevate cursor-pointer"
        onClick={onClick}
        data-testid={`card-block-${block}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${blockColors[block]}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Block {block}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Students</span>
                <span className="text-sm font-semibold">{studentCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Rooms</span>
                <span className="text-sm font-semibold">{roomCount}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Warden</span>
              <span className="text-sm font-medium">{wardenName}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>{wardenMobile}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
