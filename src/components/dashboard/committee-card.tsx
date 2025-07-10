
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, User, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

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

    const memberVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <Card className="bg-card/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-border/20 h-full">
                <CardHeader className="p-0 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg text-white">
                            <Crown className="w-5 h-5"/>
                        </div>
                        <CardTitle className="text-xl font-bold font-headline">Interim Committee</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="space-y-3 text-sm">
                        <motion.li variants={memberVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">President</span>
                            <span className="font-bold text-foreground">{committee.president}</span>
                        </motion.li>
                        <motion.li variants={memberVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">Secretary</span>
                            <span className="font-bold text-foreground">{committee.secretary}</span>
                        </motion.li>
                        <motion.li variants={memberVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }} className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">Jt. Secretary</span>
                            <span className="font-bold text-foreground">{committee.jtSecretary}</span>
                        </motion.li>
                        <motion.li variants={memberVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">Treasurer</span>
                            <span className="font-bold text-foreground">{committee.treasurer}</span>
                        </motion.li>
                    </ul>

                    <Separator className="my-4"/>

                    <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                           <Users className="w-4 h-4"/> Members
                        </h4>
                        <ul className="space-y-2.5">
                            {committee.members.map((member, index) => (
                               <motion.li 
                                key={member} 
                                variants={memberVariants} 
                                initial="hidden" 
                                animate="visible" 
                                transition={{ delay: 0.9 + index * 0.1 }} 
                                className="flex items-center gap-3"
                               >
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    <span className="text-foreground">{member}</span>
                               </motion.li> 
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
