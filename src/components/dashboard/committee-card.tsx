
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, User, Users, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { FloatingActionButton } from './floating-action-button';
import { Button } from '../ui/button';

const committee = {
    president: 'Dhruba Nan',
    secretary: 'Gourab Saha',
    jtSecretary: 'Safiulla Shaikh',
    treasurer: 'Panchami Roy',
    members: [
        'Nirmalendu Ray',
        'Shuvayu Ghosh',
        'Sayan Banerjee'
    ]
};

export function CommitteeCard() {
    const [isOpen, setIsOpen] = useState(false);

    const memberVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <FloatingActionButton
                    icon={Crown}
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-amber-500 hover:to-orange-600"
                    tooltip="View Committee"
                />
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 border-border/20 bg-card/90 backdrop-blur-xl rounded-2xl shadow-xl">
                 <Card className="bg-transparent border-0 shadow-none">
                    <CardHeader className="p-6">
                         <DialogTitle className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-lg text-white shadow-lg">
                                <Crown className="w-6 h-6"/>
                            </div>
                            <div>
                                <span className="text-xl font-bold font-headline text-foreground">Hijibiji Interim Committee</span>
                                <CardDescription className="mt-1">The current managing committee members.</CardDescription>
                            </div>
                         </DialogTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <ul className="space-y-4 text-sm">
                            <motion.li variants={memberVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="flex items-center justify-between">
                                <span className="font-medium text-muted-foreground">President</span>
                                <span className="font-bold text-foreground">{committee.president}</span>
                            </motion.li>
                            <motion.li variants={memberVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="flex items-center justify-between">
                                <span className="font-medium text-muted-foreground">Secretary</span>
                                <span className="font-bold text-foreground">{committee.secretary}</span>
                            </motion.li>
                            <motion.li variants={memberVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="flex items-center justify-between">
                                <span className="font-medium text-muted-foreground">Jt. Secretary</span>
                                <span className="font-bold text-foreground">{committee.jtSecretary}</span>
                            </motion.li>
                            <motion.li variants={memberVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="flex items-center justify-between">
                                <span className="font-medium text-muted-foreground">Treasurer</span>
                                <span className="font-bold text-foreground">{committee.treasurer}</span>
                            </motion.li>
                        </ul>

                        <Separator className="my-4"/>

                        <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                               <Users className="w-4 h-4"/> Members
                            </h4>
                            <ul className="space-y-3">
                                {committee.members.map((member, index) => (
                                   <motion.li 
                                    key={member} 
                                    variants={memberVariants} 
                                    initial="hidden" 
                                    animate="visible" 
                                    transition={{ delay: 0.5 + index * 0.1 }} 
                                    className="flex items-center gap-3 text-sm"
                                   >
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        <span className="text-foreground">{member}</span>
                                   </motion.li> 
                                ))}
                            </ul>
                        </div>
                         <DialogClose asChild>
                            <Button variant="outline" className="w-full mt-6">Close</Button>
                         </DialogClose>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
