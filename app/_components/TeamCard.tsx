import React from "react";
import Image from "next/image";
import {
Modal,
ModalContent,
ModalHeader,
ModalBody,
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
website?: string;
freelance?: string;
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
website,
freelance,
}) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <div
            className={`group rounded-xl p-6 shadow-lg transform transition-all duration-500 hover:scale-105 cursor-pointer w-[300px] 
            ${name === 'Cihan Bayram' ? 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 border-4 border-primary-400 shadow-primary-400/40' : 'bg-secondary-800/80 hover:bg-secondary-700/80'}`}
            style={name === 'Cihan Bayram' ? { boxShadow: '0 0 32px 4px #a855f7, 0 0 8px 2px #f472b6' } : {}}
            onClick={onOpen}
        >
            <div className="relative w-32 h-32 mx-auto mb-6">
            <div className={`absolute inset-0 rounded-full ${name === 'Cihan Bayram' ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'}`} />
            <div className="absolute inset-1 rounded-full overflow-hidden">
                <Image
                src={image}
                alt={`${name}'s profile`}
                fill
                className="object-cover"
                />
            </div>
            </div>

            {name === 'Cihan Bayram' && (
              <div className="flex justify-center mb-2">
                <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold shadow-lg">Site Geliştiricisi</span>
              </div>
            )}

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
            {website && (
                <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-6 h-6"
                >
                    <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.985z" />
                </svg>
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
                        
                        {freelance && (
                          <a
                            href={freelance}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 bg-primary-500 text-white rounded-full font-medium 
                                     hover:bg-primary-600 transform hover:scale-105 transition-all duration-300
                                     shadow-lg hover:shadow-primary-500/50 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                            </svg>
                            Hizmet Alın
                          </a>
                        )}
                        
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
                            {website && (
                                <a
                                    href={website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-primary-500 transition-all transform hover:scale-110"
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 24 24" 
                                        fill="currentColor" 
                                        className="w-6 h-6"
                                    >
                                        <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.985z" />
                                    </svg>
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
