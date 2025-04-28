 

interface HeaderProps {
    title: string;
}

export const Header = ({ title }: HeaderProps) => {
 
 


    return (
        <> 
            <div className="bg-secondary/50 h-[45px] rounded-md flex items-center px-4 overflow-hidden">
                 {title}
            </div>
        </>
    );

}