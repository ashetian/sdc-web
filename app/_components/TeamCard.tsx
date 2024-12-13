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
            className="group bg-secondary-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg
            transform transition-all duration-500 hover:scale-105 hover:bg-secondary-700/50 cursor-pointer"
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
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* GitHub Icon */}
                    <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                    clipRule="evenodd"
                    />
                </svg>
                </a>
            )}
                {instagram && (
                <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* İnsta Icon */}
                    <path
                    fillRule="evenodd"
                    d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
                    clipRule="evenodd"
                    />
                </svg>
                </a>
            )}
            {x && (
                <a
                href={x}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* X Icon */}
                    <path
                    fillRule="evenodd"
                    d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z"
                    clipRule="evenodd"
                    />
                </svg>
                </a>
            )}
                {linkedin && (
                <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <svg
                    className="w-6 h-6 text-gray-400 hover:text-primary-500 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* LinkedIn Icon */}
                <path
                    fillRule="evenodd"
                    d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM8 19H5v-9h3v9zm-1.5-10.2c-.97 0-1.7-.79-1.7-1.7s.73-1.7 1.7-1.7 1.7.79 1.7 1.7-.73 1.7-1.7 1.7zm13.5 10.2h-3v-4.5c0-1.08-.87-1.8-1.8-1.8s-1.8.72-1.8 1.8V19h-3v-9h3v1.26c.87-1.08 2.4-1.26 3.6-1.26 2.16 0 3.6 1.44 3.6 3.6V19z"
                    clipRule="evenodd"
                />
                </svg>
                </a>
            )}
        </div>

        <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="flex items-center justify-center bg-transparent shadow-lg rounded-xl"
        hideCloseButton
        >
            <ModalContent
            className="w-auto h-min bg-secondary-800 rounded-xl mx-auto my-auto p-6 space-y-4 shadow-lg"
            >
            {() => (
                <>
                <ModalHeader className="text-primary-400 flex flex-col text-2xl font-semibold text-center">
                    {name}
                    <p className="text-gray-400 text-lg group-hover:text-gray-300 transition-colors">
                        {role}
                    </p>
                </ModalHeader>

                <ModalBody className="flex flex-col items-center justify-center space-y-4">
                    <img src={image} alt="Avatar" className="w-32 h-32 rounded-full" />
                    <p className="text-gray-300 text-center w-60">{description}</p>
                    <p className="text-gray-400">
                        <strong>Email: </strong>
                        <a className='hover:cursor-pointer' href={`mailto:${email}`}>{email}</a>
                    </p>
                    <div className="flex justify-center space-x-4">
            {github && (
                <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* GitHub Icon */}
                    <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                    clipRule="evenodd"
                    />
                </svg>
                </a>
            )}
                {instagram && (
                <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* İnsta Icon */}
                    <path
                    fillRule="evenodd"
                    d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
                    clipRule="evenodd"
                    />
                </svg>
                </a>
            )}
            {x && (
                <a
                href={x}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* X Icon */}
                    <path
                    fillRule="evenodd"
                    d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z"
                    clipRule="evenodd"
                    />
                </svg>
                </a>
            )}
                {linkedin && (
                <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                <svg
                    className="w-6 h-6 text-gray-400 hover:text-primary-500 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* LinkedIn Icon */}
                <path
                    fillRule="evenodd"
                    d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM8 19H5v-9h3v9zm-1.5-10.2c-.97 0-1.7-.79-1.7-1.7s.73-1.7 1.7-1.7 1.7.79 1.7 1.7-.73 1.7-1.7 1.7zm13.5 10.2h-3v-4.5c0-1.08-.87-1.8-1.8-1.8s-1.8.72-1.8 1.8V19h-3v-9h3v1.26c.87-1.08 2.4-1.26 3.6-1.26 2.16 0 3.6 1.44 3.6 3.6V19z"
                    clipRule="evenodd"
                />
                </svg>
                </a>
            )}
        </div>
                </ModalBody>

                {/* Footer with Social Links */}
                <ModalFooter className="flex justify-center space-x-4">
                    <a
                    href="#"
                    className="text-primary-500 hover:text-primary-400 transition-colors"
                    >
                    <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {/* Example icon (GitHub or other social media) */}
                        <path d="..." />
                    </svg>
                    </a>
                    {/* Add other links if needed */}
                </ModalFooter>
                <Button onPress={onOpenChange} className="absolute bottom-4 right-4">Kapat</Button>
                </>
            )}
            </ModalContent>
        </Modal>
    </div>
    );
};

export default TeamCard;
