import React from "react";
import Image from "next/image";
import {
Modal,
ModalContent,
ModalHeader,
ModalBody,
ModalFooter,
Button,
useDisclosure,
} from "@nextui-org/react";
import { BsGithub, BsLinkedin } from "react-icons/bs";
import { FaXTwitter, FaInstagram } from "react-icons/fa6";

type Member = {
name: string;
email: string;
role: string;
image: string;
description: string;
instagram?: string;
x?: string;
id: number;
linkedin?: string;
github?: string;
linktree?: string;
};

const TeamCard: React.FC<Member> = ({
name,
email,
role,
image,
description,
instagram,
x,
linkedin,
github,
}) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <div
            className="group bg-secondary-800/80 rounded-xl p-6 shadow-lg
            transform transition-all duration-500 hover:scale-105 hover:bg-secondary-700/80 cursor-pointer w-[300px]"
            onClick={onOpen}
        >
            <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
            <div className="absolute inset-1 rounded-full overflow-hidden">
                <Image
                src={image}
                alt={`${name}'s profile`}
                fill
                className="object-cover"
                />
            </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
            {name}
            </h3>
            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
            {role}
            </p>

            {/* Socials */}
            <div onClick={e => e.stopPropagation()} className="flex justify-center space-x-4">
            {github && (
                <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <BsGithub className="w-6 h-6" />
                </a>
            )}
                {instagram && (
                <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <FaInstagram className="w-6 h-6" />
                </a>
            )}
            {x && (
                <a
                href={x}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <FaXTwitter className="w-6 h-6" />
                </a>
            )}
                {linkedin && (
                <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <BsLinkedin className="w-6 h-6" />
                </a>
            )}
        </div>

        <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="flex items-center justify-center bg-transparent"
        hideCloseButton
        >
            <ModalContent
            className="bg-secondary-800/95 backdrop-blur-md border border-primary-500/30 rounded-2xl mx-auto my-auto p-8 shadow-xl max-w-md shadow-primary-500/10"
            >
            {() => (
                <>
                <ModalHeader className="flex flex-col items-center gap-4 p-0">
                    <div className="relative w-40 h-40">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 animate-pulse" />
                        <div className="absolute inset-1 rounded-full overflow-hidden">
                            <Image
                                src={image}
                                alt={`${name}'s profile`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
                        <p className="text-primary-400 text-lg">{role}</p>
                    </div>
                </ModalHeader>

                <ModalBody className="flex flex-col items-center gap-6 py-6">
                    <p className="text-gray-300 text-center leading-relaxed">{description}</p>
                    
                    <div className="w-full flex flex-col items-center gap-4">
                        <a href={`mailto:${email}`} 
                           className="flex items-center gap-2 text-gray-300 hover:text-primary-400 transition-colors group">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                 className="h-5 w-5 text-primary-400 group-hover:scale-110 transition-transform" 
                                 viewBox="0 0 20 20" 
                                 fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {email}
                        </a>
                        
                        <div className="flex justify-center gap-6">
                            {github && (
                                <a
                                    href={github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-primary-500 transition-all transform hover:scale-110"
                                >
                                    <BsGithub className="w-6 h-6" />
                                </a>
                            )}
                            {instagram && (
                                <a
                                    href={instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-primary-500 transition-all transform hover:scale-110"
                                >
                                    <FaInstagram className="w-6 h-6" />
                                </a>
                            )}
                            {x && (
                                <a
                                    href={x}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-primary-500 transition-all transform hover:scale-110"
                                >
                                    <FaXTwitter className="w-6 h-6" />
                                </a>
                            )}
                            {linkedin && (
                                <a
                                    href={linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-primary-500 transition-all transform hover:scale-110"
                                >
                                    <BsLinkedin className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>
                </ModalBody>

                <Button 
                    onPress={onOpenChange} 
                    className="absolute top-2 right-2 min-w-0 w-8 h-8 rounded-full bg-secondary-700/50 hover:bg-secondary-600/50 text-gray-400"
                >
                    ✕
                </Button>
                </>
            )}
            </ModalContent>
        </Modal>
    </div>
    );
};

export default TeamCard;
