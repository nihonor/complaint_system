import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request:NextRequest,{params}:{params:{id:string}}){
    const agency=await prisma.user.findUnique({
        where:{id:params.id}
    })
    const session=await getServerSession(authOptions);
    if(!session) return NextResponse.json({},{status:401})
   
  
    if(!agency) return NextResponse.json({
        error:"Not found"
    },{status:404})
  
    await prisma.user.delete({
        where:{id:agency.id}
    })
  
    return NextResponse.json({})
  
  }